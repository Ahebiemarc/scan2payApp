// Description: Provider pour le QR code du marchand.
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { qrCodeService } from '../services/qrcode.service';
import { QrCodeDto, QrCodeImageDto } from '../types/dto';
import { useAuth } from './AuthContext';

type QrCodeContextType = {
  qrCode: QrCodeDto | null;
  qrCodeImage: QrCodeImageDto | null;
  loading: boolean;
  refetchQrCode: () => Promise<void>;
};

const QrCodeContext = createContext<QrCodeContextType | null>(null);

export const QrCodeProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const isMarchand = user?.userType === 'Marchand';

    const [qrCode, setQrCode] = useState<QrCodeDto | null>(null);
    const [qrCodeImage, setQrCodeImage] = useState<QrCodeImageDto | null>(null);
    const [loading, setLoading] = useState(false);

    const refetchQrCode = useCallback(async () => {
        if (!isMarchand) return;

        setLoading(true);
        try {
            const [detailsRes, imageRes] = await Promise.all([
                qrCodeService.getMyQrCode(),
                qrCodeService.getMyQrCodeImage()
            ]);
            setQrCode(detailsRes.data);
            setQrCodeImage(imageRes.data);
        } catch (error) {
            console.error("Failed to fetch QR Code data.", error);
        } finally {
            setLoading(false);
        }
    }, [isMarchand]);
    
    useEffect(() => {
        if (isMarchand) {
            refetchQrCode();
        }
    }, [isMarchand, refetchQrCode]);

    return (
        <QrCodeContext.Provider value={{ qrCode, qrCodeImage, loading, refetchQrCode }}>
            {children}
        </QrCodeContext.Provider>
    );
};

export const useQrCode = () => {
    const context = useContext(QrCodeContext);
    if (!context) {
        throw new Error('useQrCode must be used within a QrCodeProvider');
    }
    return context;
}