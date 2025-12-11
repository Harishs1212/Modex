import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { paymentService } from './payment.service';
import { asyncHandler } from '../../utils/asyncHandler';

export class PaymentController {
  createPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payment = await paymentService.createPayment(req.body, req.userId!, req);
    res.status(201).json({
      message: 'Payment created successfully',
      payment,
    });
  });

  getPatientPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const patientId = req.params.patientId || req.userId!;
    const status = req.query.status as string | undefined;
    const payments = await paymentService.getPatientPayments(patientId, status);
    res.json({ payments });
  });

  getPaymentById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payment = await paymentService.getPaymentById(
      req.params.paymentId,
      req.userId!,
      req.userRole!
    );
    res.json({ payment });
  });

  updatePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payment = await paymentService.updatePayment(
      req.params.paymentId,
      req.body,
      req.userId!,
      req.userRole!,
      req
    );
    res.json({
      message: 'Payment updated successfully',
      payment,
    });
  });

  getPaymentStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const patientId = req.params.patientId || req.userId!;
    const stats = await paymentService.getPaymentStats(patientId);
    res.json({ stats });
  });
}

export const paymentController = new PaymentController();

