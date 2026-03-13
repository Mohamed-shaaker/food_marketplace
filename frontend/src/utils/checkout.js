/**
 * Kampala neighborhoods/areas for delivery
 */
export const KAMPALA_AREAS = [
  "Ntinda",
  "Kololo",
  "Bukoto",
  "Makindye",
  "Kampala Central",
  "Nakasero",
  "Old Kampala",
  "Mengo",
  "Lubaga",
  "Kawempe",
  "Nakawa",
  "Kiyanja",
  "Kitintale",
  "Kibuye",
  "Bugolobi",
  "Entebbe Road",
  "Muyenga",
  "Ggaba",
  "Seguku",
  "Munyonyo",
  "Kamwokya",
  "Mutundwe",
  "Makerere",
  "Mulago",
];

/**
 * Validates and formats a phone number for Uganda
 * Accepts formats like: 0702123456, +256702123456, 256702123456
 * Returns formatted number like +256702123456
 */
export const formatPhoneNumber = (input) => {
  if (!input) return "";

  // Remove all non-digit characters except leading +
  let cleaned = input.replace(/[^\d+]/g, "");

  // Remove leading + for processing
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 256, it's already country code format
  if (cleaned.startsWith("256")) {
    return `+${cleaned}`;
  }

  // If starts with 0, replace with 256 (Uganda code)
  if (cleaned.startsWith("0")) {
    return `+256${cleaned.substring(1)}`;
  }

  // Otherwise assume it needs 256 prefix
  return `+256${cleaned}`;
};

/**
 * Validates a phone number
 * Must be 10 digits after country code (Uganda format)
 */
export const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  const formatted = formatPhoneNumber(phone);
  // Should be +256 followed by 10 digits
  return /^\+256\d{10}$/.test(formatted);
};

/**
 * Formats checkout data for API
 */
export const formatCheckoutData = (formData) => {
  return {
    phone_number: formatPhoneNumber(formData.phone),
    delivery_address: formData.address,
    delivery_area: formData.neighborhood,
    special_instructions: formData.landmarks || "",
  };
};

/**
 * Validates checkout form
 */
export const validateCheckoutForm = (formData) => {
  const errors = {};

  if (!formData.phone || !isValidPhoneNumber(formData.phone)) {
    errors.phone = "Valid phone number required (10 digits)";
  }

  if (!formData.address?.trim()) {
    errors.address = "Delivery address is required";
  }

  if (!formData.neighborhood) {
    errors.neighborhood = "Please select your neighborhood";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
