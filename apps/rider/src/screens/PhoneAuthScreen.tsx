import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBackdrop } from '../components/AuthBackdrop';
import { AuthErrorBanner } from '../components/AuthErrorBanner';
import { OtpBoxes } from '../components/OtpBoxes';
import { riderAssets } from '../config/assets';
import { brand, colors } from '../config/brand';
import { confirmPhoneCode, continueWithPhone } from '../features/auth/authService';
import { isDevAuthBypass } from '../features/auth/demo/demoAuthEnabled';
import { logAuthDev } from '../lib/auth-log';
import { parseCdPhone } from '../lib/phone';

const RESEND_SECONDS = 60;
const OTP_LENGTH = 6;
const GENERIC_SEND_ERROR = 'Impossible d’envoyer le code pour le moment. Veuillez réessayer.';

function toUserAuthMessage(error: unknown, stage: 'send' | 'verify'): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/unsupported phone provider/i.test(raw) || stage === 'send') {
    return GENERIC_SEND_ERROR;
  }
  return raw;
}

function PhoneGlyph() {
  return (
    <View style={glyph.wrap} accessibilityElementsHidden>
      <View style={glyph.body} />
      <View style={glyph.ear} />
    </View>
  );
}

export function PhoneAuthScreen() {
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(Math.max(width * 0.48, 170), 200);
  const titleSize = width < 360 ? 24 : 28;
  const cardMax = Math.min(width - 40, 440);
  const skipOtp = isDevAuthBypass();

  const [national, setNational] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [focused, setFocused] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorTick, setErrorTick] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const verifying = useRef(false);

  const parsed = parseCdPhone(national);
  const canSend = parsed.ok && !busy;

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  async function onContinue(): Promise<void> {
    if (!parsed.ok) {
      setMessage(parsed.error);
      return;
    }
    logAuthDev('submit phone', { phone: parsed.phone, step: 'normalize' });
    setBusy(true);
    setMessage(null);
    try {
      const result = await continueWithPhone(parsed.phone);
      if (result === 'demo-home') {
        return;
      }
      setNormalizedPhone(parsed.phone);
      setStage('code');
      setCode('');
      setResendIn(RESEND_SECONDS);
    } catch (e) {
      setMessage(toUserAuthMessage(e, 'send'));
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(token: string): Promise<void> {
    if (!normalizedPhone || token.length !== OTP_LENGTH || verifying.current) return;
    verifying.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await confirmPhoneCode(normalizedPhone, token);
    } catch (e) {
      setErrorTick((n) => n + 1);
      setMessage(toUserAuthMessage(e, 'verify'));
      setCode('');
    } finally {
      verifying.current = false;
      setBusy(false);
    }
  }

  function onCodeChange(next: string): void {
    setCode(next);
    if (next.length === OTP_LENGTH) {
      void onVerify(next);
    }
  }

  async function openLegal(url: string): Promise<void> {
    if (!url) return;
    await Linking.openURL(url);
  }

  const showPhoneStage = skipOtp || stage === 'phone';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <AuthBackdrop />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.column, { maxWidth: cardMax }]}>
            <View style={styles.logoHalo}>
              <View style={styles.logoPlate}>
                <Image
                  source={riderAssets.logoOnLight}
                  style={{ width: logoWidth, height: keyboardOpen ? 64 : 88 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            {showPhoneStage ? (
              <>
                <Text style={styles.kicker} maxFontSizeMultiplier={1.15}>
                  Bienvenue sur Taxi Na Biso
                </Text>
                <Text
                  style={[styles.title, { fontSize: titleSize, lineHeight: 34 }]}
                  maxFontSizeMultiplier={1.1}
                >
                  Créez votre compte
                </Text>
                <Text style={styles.subtitle} maxFontSizeMultiplier={1.15}>
                  Entrez votre numéro pour commencer votre trajet.
                </Text>

                <View style={styles.card}>
                  <Text style={styles.label}>Numéro de téléphone</Text>
                  <View style={[styles.phoneRow, focused && styles.phoneRowFocus]}>
                    <PhoneGlyph />
                    <Text style={styles.prefix}>{brand.callingCode}</Text>
                    <View style={styles.divider} />
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="81 234 56 78"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      autoComplete="tel"
                      importantForAutofill="no"
                      value={national}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onChangeText={(text) => {
                        setNational(text.replace(/\D/g, '').slice(0, 10));
                        setMessage(null);
                      }}
                      editable={!busy}
                      maxLength={10}
                    />
                  </View>
                  <Text style={styles.hint} maxFontSizeMultiplier={1.15}>
                    Nous utiliserons ce numéro pour sécuriser votre compte et vos courses.
                  </Text>

                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      pressed && !busy && canSend && styles.buttonPressed,
                      (!canSend || busy) && styles.disabled,
                    ]}
                    onPress={() => void onContinue()}
                    disabled={!canSend}
                  >
                    {busy ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <View style={styles.buttonInner}>
                        <Text style={styles.buttonText}>Continuer</Text>
                        <Text style={styles.arrow}>→</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.kicker} maxFontSizeMultiplier={1.15}>
                  Taxi Na Biso
                </Text>
                <Text
                  style={[styles.title, { fontSize: titleSize, lineHeight: 34 }]}
                  maxFontSizeMultiplier={1.1}
                >
                  Vérifiez votre numéro
                </Text>
                <Text style={styles.subtitle} maxFontSizeMultiplier={1.15}>
                  Saisissez votre code de vérification pour continuer.
                </Text>

                <View style={styles.card}>
                  <OtpBoxes
                    length={OTP_LENGTH}
                    value={code}
                    onChange={onCodeChange}
                    disabled={busy}
                    errorTick={errorTick}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      pressed && !busy && code.length === OTP_LENGTH && styles.buttonPressed,
                      (busy || code.length !== OTP_LENGTH) && styles.disabled,
                    ]}
                    onPress={() => void onVerify(code)}
                    disabled={busy || code.length !== OTP_LENGTH}
                  >
                    {busy ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <View style={styles.buttonInner}>
                        <Text style={styles.buttonText}>Vérifier</Text>
                        <Text style={styles.arrow}>→</Text>
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (!normalizedPhone || resendIn > 0 || busy) return;
                      void (async () => {
                        setBusy(true);
                        try {
                          const result = await continueWithPhone(normalizedPhone);
                          if (result === 'otp') {
                            setResendIn(RESEND_SECONDS);
                          }
                        } catch (e) {
                          setMessage(toUserAuthMessage(e, 'send'));
                        } finally {
                          setBusy(false);
                        }
                      })();
                    }}
                    disabled={busy || resendIn > 0}
                  >
                    <Text style={[styles.link, resendIn > 0 && styles.linkMuted]}>
                      {resendIn > 0 ? `Renvoyer le code (${resendIn}s)` : 'Renvoyer le code'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setStage('phone');
                      setCode('');
                      setMessage(null);
                    }}
                    disabled={busy}
                  >
                    <Text style={styles.link}>Modifier le numéro</Text>
                  </Pressable>
                </View>
              </>
            )}

            {message ? <AuthErrorBanner message={message} /> : null}

            <Text
              style={[styles.legal, keyboardOpen && styles.legalHidden]}
              maxFontSizeMultiplier={1.15}
            >
              En continuant, vous acceptez nos{' '}
              <Text
                style={[styles.legalLink, !brand.termsUrl && styles.legalDisabled]}
                onPress={() => void openLegal(brand.termsUrl)}
              >
                Conditions d’utilisation
              </Text>{' '}
              et notre{' '}
              <Text
                style={[styles.legalLink, !brand.privacyUrl && styles.legalDisabled]}
                onPress={() => void openLegal(brand.privacyUrl)}
              >
                Politique de confidentialité
              </Text>
              .
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const glyph = StyleSheet.create({
  wrap: {
    width: 18,
    height: 22,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: 12,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.6,
    borderColor: colors.brand,
  },
  ear: {
    position: 'absolute',
    top: 5,
    right: 1,
    width: 4,
    height: 6,
    borderRightWidth: 1.6,
    borderColor: colors.brand,
    borderRadius: 1,
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    alignItems: 'center',
  },
  logoHalo: {
    padding: 14,
    borderRadius: 28,
    backgroundColor: 'rgba(240,74,24,0.08)',
    marginBottom: 8,
  },
  logoPlate: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  kicker: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.brand,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  title: {
    marginTop: 6,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 15,
    lineHeight: 22,
    color: '#667085',
    textAlign: 'center',
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 10,
    textAlign: 'center',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
  },
  phoneRowFocus: {
    borderColor: colors.brand,
  },
  prefix: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 14,
    color: colors.ink,
  },
  hint: {
    marginTop: 10,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.brand,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F04A18',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonPressed: {
    backgroundColor: colors.brandDark,
    transform: [{ scale: 0.98 }],
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabled: { opacity: 0.45 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  arrow: { color: colors.white, fontWeight: '700', fontSize: 18 },
  link: {
    color: colors.brand,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
  },
  linkMuted: { color: colors.textMuted },
  legal: {
    marginTop: 22,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
    alignSelf: 'stretch',
  },
  legalHidden: { opacity: 0, height: 0, marginTop: 0 },
  legalLink: {
    color: colors.brand,
    fontWeight: '600',
  },
  legalDisabled: {
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
