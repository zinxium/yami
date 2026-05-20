import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

interface PdfLoanData {
  contractNumber: string;
  lender: { fullname: string; phone: string };
  borrower: { fullname: string; phone?: string | null; address?: string | null };
  amount: number;
  interestRate: number;
  duration: number;
  durationUnit: string;
  monthlyPayment: number;
  totalRepayment: number;
  interestAmount: number;
  startDate: Date;
  endDate: Date;
  currency: string;
  schedule: { period: number; due_date: Date; amount: number }[];
}

const BURGUNDY = '#800020';
const DARK = '#2D2D2D';
const GRAY = '#666666';

export async function generateContractPDF(data: PdfLoanData): Promise<Buffer> {
  // Pré-générer le QR code avant de créer le PDF
  let qrBuffer: Buffer | null = null;
  try {
    const qrData = JSON.stringify({
      contract: data.contractNumber,
      borrower: data.borrower.fullname,
      amount: data.amount,
      total: data.totalRepayment,
      currency: data.currency,
    });
    qrBuffer = await QRCode.toBuffer(qrData, { width: 80, margin: 1 });
  } catch {
    // QR generation failed, continue without it
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // --- En-tête ---
    doc.fontSize(28).fillColor(BURGUNDY).text('Ya Mi', { align: 'center' });
    doc.fontSize(10).fillColor(GRAY).text('Plateforme de gestion de prêts personnels', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(BURGUNDY).lineWidth(2).stroke();
    doc.moveDown();

    // --- Titre ---
    doc.fontSize(16).fillColor(DARK).text('CONTRAT DE PRÊT', { align: 'center' });
    doc.fontSize(10).fillColor(GRAY).text(`N° ${data.contractNumber}`, { align: 'center' });
    doc.moveDown();

    // --- Prêteur ---
    doc.fontSize(12).fillColor(BURGUNDY).text('PRÊTEUR');
    doc.fontSize(10).fillColor(DARK);
    doc.text(`Nom : ${data.lender.fullname}`);
    doc.text(`Téléphone : ${data.lender.phone}`);
    doc.moveDown(0.5);

    // --- Emprunteur ---
    doc.fontSize(12).fillColor(BURGUNDY).text('EMPRUNTEUR');
    doc.fontSize(10).fillColor(DARK);
    doc.text(`Nom : ${data.borrower.fullname}`);
    if (data.borrower.phone) doc.text(`Téléphone : ${data.borrower.phone}`);
    if (data.borrower.address) doc.text(`Adresse : ${data.borrower.address}`);
    doc.moveDown();

    // --- Conditions du prêt ---
    doc.fontSize(12).fillColor(BURGUNDY).text('CONDITIONS DU PRÊT');
    doc.moveDown(0.3);

    const fmt = (n: number) => n.toLocaleString('fr-FR');
    const unitLabel = data.durationUnit === 'months' ? 'mois' : 'semaines';
    const conditions = [
      ['Montant prêté', `${fmt(data.amount)} ${data.currency}`],
      ['Taux d\'intérêt', `${data.interestRate}%`],
      ['Durée', `${data.duration} ${unitLabel}`],
      ['Intérêts', `${fmt(data.interestAmount)} ${data.currency}`],
      ['Mensualité', `${fmt(data.monthlyPayment)} ${data.currency}`],
      ['Total à rembourser', `${fmt(data.totalRepayment)} ${data.currency}`],
      ['Date de début', new Date(data.startDate).toLocaleDateString('fr-FR')],
      ['Date de fin', new Date(data.endDate).toLocaleDateString('fr-FR')],
    ];

    const tableTop = doc.y;
    const col1X = 60;
    const col2X = 300;

    conditions.forEach(([label, value], i) => {
      const y = tableTop + i * 20;
      const bgColor = i % 2 === 0 ? '#F5F5F5' : '#FFFFFF';
      doc.rect(col1X - 5, y - 2, 490, 18).fill(bgColor);
      doc.fontSize(10).fillColor(DARK).text(label, col1X, y, { width: 230 });
      doc.fontSize(10).fillColor(DARK).text(value, col2X, y, { width: 240 });
    });

    doc.y = tableTop + conditions.length * 20 + 10;
    doc.moveDown();

    // --- Échéancier ---
    if (data.schedule.length > 0 && data.schedule.length <= 24) {
      doc.fontSize(12).fillColor(BURGUNDY).text('ÉCHÉANCIER DE REMBOURSEMENT');
      doc.moveDown(0.3);

      const schedTop = doc.y;
      // Header
      doc.rect(55, schedTop - 2, 490, 18).fill(BURGUNDY);
      doc.fontSize(9).fillColor('#FFFFFF');
      doc.text('Période', 60, schedTop, { width: 80 });
      doc.text('Date', 180, schedTop, { width: 150 });
      doc.text('Montant', 380, schedTop, { width: 120 });

      data.schedule.forEach((row, i) => {
        const y = schedTop + 20 + i * 18;
        if (y > 720) return; // éviter dépassement de page
        const bg = i % 2 === 0 ? '#FAF7F2' : '#FFFFFF';
        doc.rect(55, y - 2, 490, 18).fill(bg);
        doc.fontSize(9).fillColor(DARK);
        doc.text(`${row.period}`, 60, y, { width: 80 });
        doc.text(new Date(row.due_date).toLocaleDateString('fr-FR'), 180, y, { width: 150 });
        doc.text(`${fmt(row.amount)} ${data.currency}`, 380, y, { width: 120 });
      });

      doc.y = schedTop + 20 + Math.min(data.schedule.length, 36) * 18 + 10;
    }

    // --- Signatures ---
    doc.moveDown(2);
    doc.fontSize(12).fillColor(BURGUNDY).text('SIGNATURES');
    doc.moveDown();
    doc.fontSize(10).fillColor(DARK);

    const sigY = doc.y;
    doc.text('Le Prêteur :', 60, sigY);
    doc.text('L\'Emprunteur :', 320, sigY);
    doc.moveDown(3);
    doc.moveTo(60, doc.y).lineTo(250, doc.y).strokeColor(GRAY).lineWidth(0.5).stroke();
    doc.moveTo(320, doc.y).lineTo(510, doc.y).strokeColor(GRAY).lineWidth(0.5).stroke();

    // --- QR Code ---
    if (qrBuffer) {
      doc.moveDown(1);
      doc.image(qrBuffer, doc.page.width / 2 - 40, doc.y, { width: 80, height: 80 });
      doc.moveDown(5);
    }

    // --- Pied de page ---
    doc.moveDown(1);
    doc.fontSize(8).fillColor(GRAY).text(
      `Contrat ${data.contractNumber} — Généré le ${new Date().toLocaleDateString('fr-FR')} par Ya Mi`,
      50,
      doc.y,
      { align: 'center' },
    );

    doc.end();
  });
}
