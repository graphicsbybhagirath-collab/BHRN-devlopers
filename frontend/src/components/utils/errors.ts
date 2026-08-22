export const getErrorMessage = (err: any, fallback = 'An unexpected error occurred. Please try again.'): string => {
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }
  if (err?.response?.data?.detail) {
    return err.response.data.detail;
  }
  if (err?.message) {
    return err.message;
  }
  return fallback;
};
