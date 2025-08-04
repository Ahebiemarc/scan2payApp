/*import { getStatusStyle } from "@/app/(app)/transaction-detail";
import { mockFullTransactions } from "@/app/(tabs)/dashboard";
import { COLORS } from "@/constants/Colors";
import { Asset } from "expo-asset";

// Define the expected structure of the transaction data
type TransactionDetail = typeof mockFullTransactions[0];

// --- Function to generate HTML for the receipt ---
export const generateReceiptHtml = async (transaction: TransactionDetail): Promise<string> => {
    // --- Load the logo asset ---
    // Ensure your logo is in the assets/images folder and listed in app.json assets
    const logoAsset = Asset.fromModule(require('@/assets/images/logo.png'));
    await logoAsset.downloadAsync(); // Make sure it's downloaded
    const logoUri = logoAsset.localUri || logoAsset.uri; // Use localUri if available

    // --- Basic CSS Styling ---
    const styles = `
        body { font-family: sans-serif; margin: 20px; color: #333; }
        .container { border: 1px solid #eee; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
        .logo { width: 60px; height: 60px; margin-bottom: 10px; }
        h1 { color: ${COLORS.primary}; margin: 0; font-size: 24px; }
        h2 { font-size: 20px; color: #555; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;}
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .details-table td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        .details-table td:first-child { color: #666; width: 40%; }
        .details-table td:last-child { text-align: right; font-weight: 500; }
        .amount { font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 15px; }
        .status { text-align: center; font-weight: bold; margin-bottom: 25px; padding: 5px 10px; border-radius: 15px; display: inline-block; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #aaa; }
    `;

    // --- HTML Content ---
    // Use inline styles for status color as classes might not work reliably across renderers
    const statusStyle = getStatusStyle(transaction.status); // Get status style object
    const isReceived = transaction.type === 'received' || transaction.type === 'topup';
    const amountSign = isReceived ? '+' : '-';
    const amountColor = isReceived ? COLORS.success : COLORS.error;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reçu Scan2Pay</title>
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUri}" alt="Logo Scan2Pay" class="logo">
                    <h1>Reçu de Transaction</h1>
                </div>

                <p class="amount" style="color: ${amountColor};">${amountSign} € ${transaction.amount.toFixed(2)}</p>
                <div style="text-align: center; margin-bottom: 25px;">
                   <span class="status" style="background-color: ${statusStyle.color}20; color: ${statusStyle.color};">
                       ${statusStyle.text}
                   </span>
                </div>


                <h2>Détails</h2>
                <table class="details-table">
                    <tr><td>Description</td><td>${transaction.description}</td></tr>
                    <tr><td>${isReceived ? 'Envoyé par' : 'Envoyé à'}</td><td>${transaction.recipientName || 'N/A'}</td></tr>
                    <tr><td>ID Transaction</td><td>${transaction.id}</td></tr>
                    <tr><td>Date</td><td>${transaction.date}</td></tr>
                    <tr><td>Heure</td><td>${transaction.time}</td></tr>
                </table>

                 <h2>Montants</h2>
                 <table class="details-table">
                    <tr><td>Montant initial</td><td>€ ${transaction.originalAmount?.toFixed(2)}</td></tr>
                    <tr><td>Frais</td><td>€ ${transaction.fee?.toFixed(2) || '0.00'}</td></tr>
                    <tr><td><strong>Montant Final</strong></td><td><strong>€ ${transaction.amount.toFixed(2)}</strong></td></tr>
                 </table>

                <div class="footer">
                    Merci d'utiliser Scan2Pay.
                </div>
            </div>
        </body>
        </html>
    `;
};*/

// Helper function (reuse from modal display logic)


// Description: Logique isolée pour la génération de reçu en HTML.
// ============================================================
import { Asset } from 'expo-asset';
import { TransactionDto } from '@/types/dto';
import { COLORS } from '@/constants/Colors';

// Helper function pour obtenir les styles de statut
const getStatusStyle = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
        case 'complete': case 'completed': return { color: COLORS.success, text: 'Terminé' };
        case 'pending': return { color: COLORS.warning, text: 'En attente' };
        case 'failed': return { color: COLORS.error, text: 'Échoué' };
        default: return { color: COLORS.darkGrey, text: status || 'Inconnu' };
    }
};

export const generateReceiptHtml = async (transaction: TransactionDto): Promise<string> => {
    // Charger le logo
    const logoAsset = Asset.fromModule(require('../assets/images/icon.png'));
    await logoAsset.downloadAsync();
    const logoUri = logoAsset.localUri || logoAsset.uri;

    const styles = `
        body { font-family: sans-serif; margin: 20px; color: #333; }
        .container { border: 1px solid #eee; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
        .logo { width: 60px; height: 60px; margin-bottom: 10px; }
        h1 { color: ${COLORS.primary}; margin: 0; font-size: 24px; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .details-table td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        .details-table td:first-child { color: #666; width: 40%; }
        .details-table td:last-child { text-align: right; font-weight: 500; }
        .amount { font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 15px; }
        .status { text-align: center; font-weight: bold; margin-bottom: 25px; padding: 5px 10px; border-radius: 15px; display: inline-block; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #aaa; }
    `;

    const statusStyle = getStatusStyle(transaction.status);
    const isReceived = transaction.type.toLowerCase().includes('received') || transaction.type.toLowerCase().includes('deposit');
    const amountSign = isReceived ? '+' : '-';
    const amountColor = isReceived ? COLORS.success : COLORS.error;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Reçu Scan2Pay</title>
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUri}" alt="Logo" class="logo">
                    <h1>Reçu de Transaction</h1>
                </div>
                <p class="amount" style="color: ${amountColor};">${amountSign} € ${transaction.amount.toFixed(2)}</p>
                <div style="text-align: center; margin-bottom: 25px;">
                   <span class="status" style="background-color: ${statusStyle.color}20; color: ${statusStyle.color};">
                       ${statusStyle.text}
                   </span>
                </div>
                <table class="details-table">
                    <tr><td>Description</td><td>${transaction.description}</td></tr>
                    <tr><td>Date</td><td>${new Date(transaction.timestamp).toLocaleDateString('fr-FR')}</td></tr>
                    <tr><td>Heure</td><td>${new Date(transaction.timestamp).toLocaleTimeString('fr-FR')}</td></tr>
                    <tr><td>ID Transaction</td><td>${transaction.id}</td></tr>
                </table>
                <div class="footer">Merci d'utiliser Scan2Pay.</div>
            </div>
        </body>
        </html>
    `;
};