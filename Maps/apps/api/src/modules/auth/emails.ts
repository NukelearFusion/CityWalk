import { PASSWORD_RESET, TWO_FACTOR } from '../../config/auth-policy.js';

/**
 * Bodies of the one-time-code messages.
 *
 * Written in Polish to match the product, and kept apart from the handlers so
 * the wording can be reviewed without reading authentication logic.
 */

export function signInCodeMail(displayName: string, code: string) {
  return {
    subject: 'CityWalk — kod logowania do panelu administracyjnego',
    text: [
      'Zażądano logowania do panelu administracyjnego.',
      '',
      `Użytkownik: ${displayName}`,
      `Kod: ${code}`,
      `Ważny przez: ${TWO_FACTOR.codeTtlMinutes} minut.`,
      '',
      'Jeśli to nie Ty, natychmiast zmień hasło.',
    ].join('\n'),
  };
}

export function passwordResetMail(displayName: string, code: string) {
  return {
    subject: 'CityWalk — kod odzyskiwania hasła',
    text: [
      'Zażądano zmiany hasła do konta administratora.',
      '',
      `Użytkownik: ${displayName}`,
      `Kod: ${code}`,
      `Ważny przez: ${PASSWORD_RESET.codeTtlMinutes} minut.`,
      '',
      'Jeśli to nie Ty, zignoruj tę wiadomość — hasło nie zostanie zmienione.',
    ].join('\n'),
  };
}
