import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

export async function shareWhatsApp(text: string, phone?: string) {
  const encodedText = encodeURIComponent(text);
  const url = phone
    ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;

  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    await copyToClipboard(text);
  }
}

export async function shareTicket(text: string, phone?: string) {
  try {
    await shareWhatsApp(text, phone);
  } catch {
    await copyToClipboard(text);
  }
}

export async function shareTelegram(text: string) {
  const encodedText = encodeURIComponent(text);
  const url = `tg://msg?text=${encodedText}`;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  }
}

export async function copyToClipboard(text: string) {
  await Clipboard.setStringAsync(text);
}

export async function shareGeneric(text: string) {
  if (await Sharing.isAvailableAsync()) {
    // Sharing.shareAsync requires a file URI; for text, use clipboard fallback
    await copyToClipboard(text);
  }
}
