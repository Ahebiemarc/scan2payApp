// --- Auth DTOs ---
export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword:string
  userType: 'Client' | 'Marchand';
  phoneNumber?: string;
  address?: string;
}

export interface LoginUserDto {
  email: string;
  password?: string;
}

export interface AuthResponseDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'Client' | 'Marchand';
  token: string;
  expiresAt: string;
}

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    userType: 'Client' | 'Marchand';
    dateRegistered: string;
    twoFactorEnabled: boolean;
    wallet?: WalletDto; 
    qrCode?: QrCodeDto;
}
export interface UpdateUserProfileDto { /* ... */ }
export interface ChangePasswordDto { /* ... */ }

// --- Wallet & Transaction DTOs ---
export interface WalletDto {
    id: string;
    balance: number;
    currency: string;
}

 enum TransactionType{
        Deposit,      // Recharge
        Withdrawal,   // Retrait
        PaymentSent,  // Paiement effectué
        PaymentReceived, // Paiement reçu
        RefundIssued, // Remboursement émis
        RefundReceived // Remboursement reçu
}

export interface TransactionDto {
    id: string;
    amount: number;
    currency: string;
  type: any
    status: string;
    timestamp: string;
    description: string;
    payerEmail?: string;
    payeeEmail?: string;
    [key: string]: any; // pour permettre d'autres propriétés dynamiques

}

export interface TopUpRequestDto {
    amount: number;
    paymentMethodId: string;
    currency?: string;
    type:string;
}

// DTO pour une requête de retrait (Withdrawal)
export interface WithdrawalRequestDto {
  amount: number;                         // Le montant à retirer (decimal en C#, number en TS)
  destinationPaymentMethodId: string;     // L'ID de la méthode de paiement de destination (Guid en C#, string en TS)
  currency?: string;                      // La devise, par défaut "EUR" en C# (optionnel car a une valeur par défaut)
  description?: string;                   // (Optionnel) Une description pour le retrait
}

// --- QR Code & Payment DTOs ---
export interface QrCodeDto {
    id: string;
    marchandId: string;
    qrCodeData: string;
    isActive: boolean;
}

export interface QrCodeImageDto {
    qrImageBase64: string;
}

export interface CreatePaymentDto {
    qrCodeData: string;
    amount: number;
}

// --- Notification DTOs ---
export interface NotificationDto {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    type: string;
    relatedEntityId?: string;
}

// --- PaymentMethod DTOs ---
export interface PaymentMethodDto { /* ... */ 
      [key: string]: any; // pour permettre d'autres propriétés dynamiques

}
export interface CreatePaymentMethodDto { /* ... */ 
      [key: string]: any; // pour permettre d'autres propriétés dynamiques

}






// types/dto.ts

// DTO pour les méthodes de paiement récupérées depuis le backend
/*export interface PaymentMethodDto {
  id: string; // GUID
  provider: string; // Ex: "Stripe", "PayPal"
  type: 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Bank Account' | 'PayPal'; // Ex: "Visa", "Bank Account"
  maskedIdentifier: string; // Ex: "**** 1234" ou "compte PayPal"
  isDefault: boolean;
  // Ajoutez d'autres champs si votre backend les retourne (ex: expiryDate, cardHolderName, etc.)
}*/

// DTO pour ajouter une nouvelle méthode de paiement (pour le formulaire)
// ATTENTION : Cette structure est un exemple pour une entrée directe.
// Dans une vraie application, vous passeriez souvent un TOKEN généré par une passerelle de paiement (ex: Stripe Token).
/*export interface CreatePaymentMethodDto {
  cardNumber: string;
  expiryMonth: string; // Ou number
  expiryYear: string; // Ou number
  cvc: string;
  cardHolderName: string;
  type: 'Visa' | 'Mastercard' | 'Amex' | 'Discover'; // Le type de carte, pourrait être déduit
  provider: string; // Ex: "Stripe"
}*/