// Description: Service pour gérer les QR codes du marchand.
// ============================================================
import api from './api';
import { QrCodeDto, QrCodeImageDto } from '../types/dto';

export const qrCodeService = {
    getMyQrCode: () => {
        return api.get<QrCodeDto>('/qrcodes/my-qrcode');
    },
    getMyQrCodeImage: () => {
        return api.get<QrCodeImageDto>('/qrcodes/my-qrcode/image');
    },
    validateQrCode: (qrData: string) => {
        return api.get<QrCodeDto>(`/qrcodes/validate/${encodeURIComponent(qrData)}`);
    }
}


