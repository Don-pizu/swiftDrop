// util/phoneFormatter.js

function formatPhone(phoneNumber) {
  if (!phoneNumber) 
    return null;

  let cleaned = phoneNumber.toString().trim();

  // If it already starts with +, assume it's valid format
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If it starts with 0 (Nigerian local format, e.g. 080...)
  if (cleaned.startsWith("0")) {
    return "+234" + cleaned.slice(1);
  }

  // If it starts with 234 but no +
  if (cleaned.startsWith("234")) {
    return "+" + cleaned;
  }

  // Otherwise return as is (user gave something like +44...)
  return cleaned;
}

module.exports = { formatPhone };
