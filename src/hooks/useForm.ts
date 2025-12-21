// ==========================================
// Custom Hook: useForm
// Handle form state dan validation
// ==========================================
import { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { FormState, FormHandlers } from '../types';

interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string | undefined>;
  touched: Record<keyof T, boolean | undefined>;
  isSubmitting: boolean;
  handlers: FormHandlers<T>;
  setFieldError: (fieldName: keyof T, errorMessage: string) => void;
  resetForm: () => void;
  setValues: (values: T) => void;
}

/**
 * Hook untuk handle form state, validation, dan submission
 * @param initialValues - Initial form values
 * @param onSubmit - Callback saat form di-submit
 * @returns Object dengan form state dan handler functions
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void> | void
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | undefined>>(
    {} as Record<keyof T, string | undefined>
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean | undefined>>(
    {} as Record<keyof T, boolean | undefined>
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Handle input change untuk text, email, password, checkbox, dll
   */
  const handleChange = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ): void => {
      const { name, value, type } = e.target;
      const isCheckbox = type === 'checkbox';
      const inputValue = isCheckbox
        ? (e.target as HTMLInputElement).checked
        : value;

      setValues((prev) => ({
        ...prev,
        [name]: inputValue,
      }));
    },
    []
  );

  /**
   * Handle blur untuk mark field sebagai touched
   */
  const handleBlur = useCallback(
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ): void => {
      const { name } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    },
    []
  );

  /**
   * Set error untuk field tertentu
   */
  const setFieldError = useCallback(
    (fieldName: keyof T, errorMessage: string): void => {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));
    },
    []
  );

  /**
   * Handle form submit dengan validation
   */
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  /**
   * Reset form ke initial values
   */
  const resetForm = useCallback((): void => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string | undefined>);
    setTouched({} as Record<keyof T, boolean | undefined>);
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Update values directly (untuk programmatic updates)
   */
  const updateValues = useCallback((newValues: T): void => {
    setValues(newValues);
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handlers: {
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldError,
      resetForm,
    },
    setFieldError,
    resetForm,
    setValues: updateValues,
  };
};
