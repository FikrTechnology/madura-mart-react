// ==========================================
// Custom Hook: useForm
// Handle form state dan validation
// ==========================================
import { useState, useCallback } from 'react';

/**
 * Hook untuk handle form state dan validation
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Callback saat submit
 */
export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  /**
   * Handle blur untuk touched field
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  /**
   * Set error untuk field tertentu
   */
  const setFieldError = useCallback((fieldName, errorMessage) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));
  }, []);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  /**
   * Reset form ke initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    setValues,
    resetForm
  };
};
