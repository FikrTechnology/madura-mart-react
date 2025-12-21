// ==========================================
// PDF Generator Utility
// ==========================================
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Transaction } from '../types';

// Color definitions untuk PDF styling
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface Colors {
  primary: RGBColor;
  secondary: RGBColor;
  success: RGBColor;
  warning: RGBColor;
  danger: RGBColor;
  dark: RGBColor;
  light: RGBColor;
  text: RGBColor;
  textGray: RGBColor;
}

const colors: Colors = {
  primary: { r: 102, g: 126, b: 234 }, // Purple
  secondary: { r: 118, g: 75, b: 162 }, // Dark Purple
  success: { r: 72, g: 187, b: 120 }, // Green
  warning: { r: 246, g: 173, b: 85 }, // Orange
  danger: { r: 252, g: 129, b: 129 }, // Red
  dark: { r: 45, g: 55, b: 72 }, // Dark Gray
  light: { r: 237, g: 242, b: 247 }, // Light Gray
  text: { r: 0, g: 0, b: 0 }, // Black
  textGray: { r: 113, g: 128, b: 150 }, // Gray
};

/**
 * Generate PDF dari HTML element
 * @param element - HTMLElement yang akan di-convert ke PDF
 * @param filename - Nama file PDF (default: 'document.pdf')
 * @returns Promise<true> jika berhasil
 */
export const generatePDF = async (
  element: HTMLElement,
  filename: string = 'document.pdf'
): Promise<boolean> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait' as const,
      unit: 'mm' as const,
      format: 'a4' as const,
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

interface ProductPerformance {
  name: string;
  quantity: number;
  revenue: number;
}

interface CategoryPerformance {
  category: string;
  quantity: number;
  revenue: number;
}

interface Outlet {
  id: string;
  name: string;
  [key: string]: any;
}

/**
 * Generate Sales PDF Report dengan analytics
 * @param filteredTransactions - Array of transactions untuk di-report
 * @param outlets - Array of outlets untuk reference
 * @param reportViewMode - Mode view ('all' atau specific outlet)
 * @param reportPeriod - Period untuk report
 * @param topProducts - Array of top selling products
 * @param selectedOutletName - Nama outlet yang di-report
 */
export const generateSalesPDF = async (
  filteredTransactions: Transaction[],
  outlets: Outlet[],
  reportViewMode: 'all' | string,
  reportPeriod: 'today' | 'week' | 'month' | 'all',
  topProducts: ProductPerformance[],
  selectedOutletName: string
): Promise<void> => {
  try {
    const doc = new jsPDF('p' as const, 'mm' as const, 'a4' as const);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 12;

    // ===== HEADER SECTION =====
    drawHeader(doc, pageWidth, margin, yPosition);
    yPosition += 22;

    // Info Section
    yPosition = drawInfoSection(
      doc,
      pageWidth,
      margin,
      maxWidth,
      yPosition,
      selectedOutletName,
      reportPeriod
    );

    // Summary Section
    yPosition = drawSummaryCards(
      doc,
      pageWidth,
      margin,
      maxWidth,
      yPosition,
      filteredTransactions
    );

    // Payment Method Section
    yPosition = drawPaymentMethodSection(
      doc,
      pageWidth,
      margin,
      maxWidth,
      yPosition,
      filteredTransactions
    );

    // Check if new page needed
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 12;
    }

    // Outlet Performance (if all outlets selected)
    if (reportViewMode === 'all' && outlets.length > 1) {
      yPosition = drawOutletPerformance(
        doc,
        pageWidth,
        margin,
        maxWidth,
        yPosition,
        filteredTransactions,
        outlets
      );
    }

    // Check if new page needed
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 12;
    }

    // Top Products Section
    if (topProducts && topProducts.length > 0) {
      yPosition = drawTopProducts(
        doc,
        pageWidth,
        margin,
        maxWidth,
        yPosition,
        topProducts
      );
    }

    // Check if new page needed
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 12;
    }

    // Category Performance Section
    const categoryPerformance = calculateCategoryPerformance(
      filteredTransactions
    );
    if (categoryPerformance.length > 0) {
      yPosition = drawCategoryPerformance(
        doc,
        pageWidth,
        margin,
        maxWidth,
        yPosition,
        categoryPerformance
      );
    }

    // Footer
    drawFooter(doc, pageWidth, pageHeight);

    // Save PDF
    const fileName =
      reportViewMode === 'all'
        ? `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.pdf`
        : `Laporan_${selectedOutletName.replace(/\s+/g, '_')}_${new Date()
            .toISOString()
            .split('T')[0]}.pdf`;

    doc.save(fileName);
  } catch (error) {
    throw error;
  }
};

// ===== HELPER FUNCTIONS =====

const drawHeader = (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  yPosition: number
): void => {
  // Background rectangle
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('LAPORAN PENJUALAN', pageWidth / 2, 12, { align: 'center' });

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 220);
  doc.text('Madura Mart POS System', pageWidth / 2, 20, { align: 'center' });
};

const drawInfoSection = (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  maxWidth: number,
  yPosition: number,
  outletName: string,
  period: string
): number => {
  // Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('INFORMASI LAPORAN', margin, yPosition);
  yPosition += 5;

  // Info boxes with background
  const infoItems = [
    { label: 'Outlet', value: outletName },
    { label: 'Periode', value: getPeriodLabel(period) },
    {
      label: 'Tanggal',
      value: new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
  ];

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  infoItems.forEach((item) => {
    const boxY = yPosition;
    // Background
    doc.setFillColor(240, 245, 251);
    doc.rect(margin, boxY - 2.5, maxWidth, 4, 'F');

    // Text
    doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
    doc.text(`${item.label}:`, margin + 1, boxY);
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value.substring(0, 40), margin + 22, boxY);
    doc.setFont('helvetica', 'normal');
    yPosition += 5;
  });

  yPosition += 2;

  // Separator line
  doc.setDrawColor(200, 210, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  return yPosition + 4;
};

const drawSummaryCards = (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  maxWidth: number,
  yPosition: number,
  transactions: Transaction[]
): number => {
  const cardWidth = (maxWidth - 2) / 2;
  const cardHeight = 16;

  // Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('RINGKASAN PENJUALAN', margin, yPosition);
  yPosition += 4;

  // Calculate data
  const totalSales = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalTx = transactions.length;
  const totalItems = transactions.reduce(
    (sum, t) =>
      sum +
      (t.items
        ? t.items.reduce((s, i) => s + (i.quantity || 0), 0)
        : 0),
    0
  );
  const avgPerTx = totalTx > 0 ? totalSales / totalTx : 0;

  interface SummaryItem {
    label: string;
    value: string;
    color: RGBColor;
  }

  const summaryData: SummaryItem[] = [
    {
      label: 'Total Penjualan',
      value: `Rp ${totalSales.toLocaleString('id-ID')}`,
      color: colors.primary,
    },
    {
      label: 'Total Transaksi',
      value: totalTx.toString(),
      color: colors.success,
    },
    {
      label: 'Total Item Terjual',
      value: totalItems.toString(),
      color: colors.warning,
    },
    {
      label: 'Rata-rata/Transaksi',
      value: `Rp ${avgPerTx.toLocaleString('id-ID')}`,
      color: colors.secondary,
    },
  ];

  summaryData.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cardX = margin + col * (cardWidth + 1);
    const cardY = yPosition + row * (cardHeight + 1.5);

    // Card background
    doc.setFillColor(245, 247, 251);
    doc.rect(cardX, cardY, cardWidth, cardHeight, 'F');

    // Card border - left colored stripe
    doc.setFillColor(item.color.r, item.color.g, item.color.b);
    doc.rect(cardX, cardY, 2, cardHeight, 'F');

    // Card outline
    doc.setDrawColor(230, 235, 245);
    doc.setLineWidth(0.3);
    doc.rect(cardX, cardY, cardWidth, cardHeight);

    // Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
    doc.text(item.label, cardX + 4, cardY + 3);

    // Value
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(item.color.r, item.color.g, item.color.b);
    const truncatedValue =
      item.value.length > 20 ? item.value.substring(0, 17) + '...' : item.value;
    const textWidth = doc.getTextWidth(truncatedValue);
    doc.text(truncatedValue, cardX + cardWidth - 2 - textWidth, cardY + 11);
  });

  return yPosition + 35;
};

const drawPaymentMethodSection = (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  maxWidth: number,
  yPosition: number,
  transactions: Transaction[]
): number => {
  if (transactions.length === 0) return yPosition;

  yPosition += 2;
  // Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('METODE PEMBAYARAN', margin, yPosition);
  yPosition += 4;

  // Calculate payment breakdown
  const paymentBreakdown = {
    cash: transactions
      .filter((t) => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + (t.total || 0), 0),
    transfer: transactions
      .filter((t) => t.paymentMethod === 'transfer')
      .reduce((sum, t) => sum + (t.total || 0), 0),
    ewallet: transactions
      .filter((t) => t.paymentMethod === 'card')
      .reduce((sum, t) => sum + (t.total || 0), 0),
  };

  const total =
    paymentBreakdown.cash +
    paymentBreakdown.transfer +
    paymentBreakdown.ewallet;

  interface PaymentMethod {
    name: string;
    value: number;
    color: RGBColor;
  }

  const methods: PaymentMethod[] = [
    { name: 'Tunai', value: paymentBreakdown.cash, color: colors.primary },
    {
      name: 'Transfer',
      value: paymentBreakdown.transfer,
      color: colors.success,
    },
    { name: 'E-Wallet', value: paymentBreakdown.ewallet, color: colors.warning },
  ];

  doc.setFontSize(8);
  methods.forEach((method, idx) => {
    const percentage = total > 0 ? ((method.value / total) * 100).toFixed(1) : 0;
    const barWidth = 35;
    const barHeight = 3.5;
    const barX = margin + 18;

    // Background row
    if (idx % 2 === 0) {
      doc.setFillColor(248, 249, 251);
      doc.rect(margin, yPosition - 2, maxWidth, 5.5, 'F');
    }

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
    doc.text(`${method.name}:`, margin + 1, yPosition + 1);

    // Bar background
    doc.setFillColor(240, 242, 245);
    doc.rect(barX, yPosition - 1.5, barWidth, barHeight, 'F');

    // Bar fill
    doc.setFillColor(method.color.r, method.color.g, method.color.b);
    const fillWidth = total > 0 ? (method.value / total) * barWidth : 0;
    if (fillWidth > 0) {
      doc.rect(barX, yPosition - 1.5, fillWidth, barHeight, 'F');
    }

    // Amount
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(method.color.r, method.color.g, method.color.b);
    doc.setFontSize(7);
    const amountText = `Rp ${method.value.toLocaleString('id-ID')} (${percentage}%)`.substring(0, 22);
    doc.text(amountText, barX + barWidth + 1, yPosition + 1);
    doc.setFontSize(8);

    yPosition += 6;
  });

  return yPosition + 3;
};

const drawOutletPerformance = (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  maxWidth: number,
  yPosition: number,
  transactions: Transaction[],
  outlets: Outlet[]
): number => {
  yPosition += 2;
  // Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('PERFORMA OUTLET', margin, yPosition);
  yPosition += 4;

  // Table header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);

  const col1X = margin;
  const col2X = margin + 35;
  const col3X = margin + 70;
  const col4X = margin + 95;

  doc.rect(col1X, yPosition - 2.5, 32, 4, 'F');
  doc.rect(col2X, yPosition - 2.5, 32, 4, 'F');
  doc.rect(col3X, yPosition - 2.5, 22, 4, 'F');
  doc.rect(col4X, yPosition - 2.5, maxWidth - (col4X - margin), 4, 'F');

  doc.text('Outlet', col1X + 1, yPosition);
  doc.text('Penjualan', col2X + 1, yPosition);
  doc.text('Transaksi', col3X + 1, yPosition);
  doc.text('Rata-rata', col4X + 1, yPosition);

  yPosition += 4.5;

  // Table rows
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  outlets.slice(0, 8).forEach((outlet, idx) => {
    const outletTx = transactions.filter(
      (t) => t.outletId === outlet.id
    );
    const sales = outletTx.reduce((sum, t) => sum + (t.total || 0), 0);
    const txCount = outletTx.length;
    const avgTx = txCount > 0 ? sales / txCount : 0;

    // Alternate row color
    if (idx % 2 === 0) {
      doc.setFillColor(248, 249, 251);
      doc.rect(margin, yPosition - 2, maxWidth, 4, 'F');
    }

    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text(outlet.name.substring(0, 18), col1X + 1, yPosition);
    doc.text(`Rp ${(sales / 1000000).toFixed(1)}M`.substring(0, 12), col2X + 1, yPosition);
    doc.text(txCount.toString(), col3X + 1, yPosition);
    doc.text(`Rp ${(avgTx / 1000).toFixed(0)}K`.substring(0, 12), col4X + 1, yPosition);

    yPosition += 4;
  });

  return yPosition + 3;
};

const drawTopProducts = (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  maxWidth: number,
  yPosition: number,
  products: ProductPerformance[]
): number => {
  yPosition += 2;
  // Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('PRODUK TERLARIS (TOP 10)', margin, yPosition);
  yPosition += 4;

  // Table header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(colors.success.r, colors.success.g, colors.success.b);

  const col1X = margin;
  const col2X = margin + 4;
  const col3X = margin + 50;
  const col4X = margin + 70;

  doc.rect(col1X, yPosition - 2.5, 3, 4, 'F');
  doc.rect(col2X, yPosition - 2.5, 43, 4, 'F');
  doc.rect(col3X, yPosition - 2.5, 17, 4, 'F');
  doc.rect(col4X, yPosition - 2.5, maxWidth - (col4X - margin), 4, 'F');

  doc.text('#', col1X + 0.5, yPosition);
  doc.text('Produk', col2X + 1, yPosition);
  doc.text('Qty', col3X + 1, yPosition);
  doc.text('Revenue', col4X + 1, yPosition);

  yPosition += 4.5;

  // Table rows
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  products.slice(0, 8).forEach((product, idx) => {
    // Alternate row color
    if (idx % 2 === 0) {
      doc.setFillColor(248, 254, 250);
      doc.rect(margin, yPosition - 2, maxWidth, 4, 'F');
    }

    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text((idx + 1).toString(), col1X + 0.5, yPosition);

    const prodName = product.name.substring(0, 28);
    doc.text(prodName, col2X + 1, yPosition);
    doc.text(product.quantity.toString(), col3X + 1, yPosition);
    doc.text(
      `Rp ${(product.revenue / 1000).toFixed(0)}K`.substring(0, 12),
      col4X + 1,
      yPosition
    );

    yPosition += 4;
  });

  return yPosition + 3;
};

const drawCategoryPerformance = (
  doc: jsPDF,
  pageWidth: number,
  margin: number,
  maxWidth: number,
  yPosition: number,
  categories: CategoryPerformance[]
): number => {
  yPosition += 2;
  // Title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('PERFORMA KATEGORI', margin, yPosition);
  yPosition += 4;

  // Table header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(colors.warning.r, colors.warning.g, colors.warning.b);

  const col1X = margin;
  const col2X = margin + 50;
  const col3X = margin + 70;

  doc.rect(col1X, yPosition - 2.5, 45, 4, 'F');
  doc.rect(col2X, yPosition - 2.5, 17, 4, 'F');
  doc.rect(col3X, yPosition - 2.5, maxWidth - (col3X - margin), 4, 'F');

  doc.text('Kategori', col1X + 1, yPosition);
  doc.text('Qty', col2X + 1, yPosition);
  doc.text('Revenue', col3X + 1, yPosition);

  yPosition += 4.5;

  // Table rows
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  categories.slice(0, 8).forEach((cat, idx) => {
    // Alternate row color
    if (idx % 2 === 0) {
      doc.setFillColor(255, 253, 248);
      doc.rect(margin, yPosition - 2, maxWidth, 4, 'F');
    }

    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text(cat.category.substring(0, 25), col1X + 1, yPosition);
    doc.text(cat.quantity.toString(), col2X + 1, yPosition);
    doc.text(
      `Rp ${(cat.revenue / 1000).toFixed(0)}K`.substring(0, 12),
      col3X + 1,
      yPosition
    );

    yPosition += 4;
  });

  return yPosition + 3;
};

const drawFooter = (
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number
): void => {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);

  // Line
  doc.setDrawColor(colors.light.r, colors.light.g, colors.light.b);
  doc.line(12, pageHeight - 12, pageWidth - 12, pageHeight - 12);

  // Text
  doc.text('Generated by Madura Mart POS System', pageWidth / 2, pageHeight - 7, {
    align: 'center' as const,
  });
};

const getPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    today: 'Hari Ini',
    week: '7 Hari Terakhir',
    month: '30 Hari Terakhir',
    all: 'Semua Waktu',
  };
  return labels[period] || period;
};

const calculateCategoryPerformance = (
  transactions: Transaction[]
): CategoryPerformance[] => {
  const categoryStats: Record<string, CategoryPerformance> = {};

  transactions.forEach((tx) => {
    tx.items?.forEach((item) => {
      const category = (item as any).category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          quantity: 0,
          revenue: 0,
        };
      }
      categoryStats[category].quantity += (item as any).quantity || 0;
      categoryStats[category].revenue +=
        ((item as any).quantity || 0) * ((item as any).price || 0);
    });
  });

  return Object.values(categoryStats)
    .sort((a, b) => b.revenue - a.revenue)
    .filter((cat) => cat.revenue > 0);
};
