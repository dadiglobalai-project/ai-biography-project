const EMAIL_LOCAL_PART_REGEX = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const TOP_LEVEL_DOMAIN_REGEX = /^[A-Za-z]{2,24}$/;

export function getEmailValidationError(email: string) {
  const value = email.trim();

  if (!value) {
    return 'Email address is required';
  }

  if (value.length > 254 || /\s/.test(value)) {
    return 'Please enter a valid email address';
  }

  const parts = value.split('@');
  if (parts.length !== 2) {
    return 'Please enter a valid email address';
  }

  const [localPart, domain] = parts;
  if (
    !localPart ||
    localPart.length > 64 ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.includes('..') ||
    !EMAIL_LOCAL_PART_REGEX.test(localPart)
  ) {
    return 'Please enter a valid email address';
  }

  const domainLabels = domain.split('.');
  if (domainLabels.length < 2) {
    return 'Please enter a valid email address';
  }

  const topLevelDomain = domainLabels[domainLabels.length - 1];
  if (!TOP_LEVEL_DOMAIN_REGEX.test(topLevelDomain)) {
    return 'Please enter a valid email address';
  }

  if (
    domainLabels.some(
      label => !DOMAIN_LABEL_REGEX.test(label) || /^[0-9]+$/.test(label)
    )
  ) {
    return 'Please enter a valid email address';
  }

  return null;
}
