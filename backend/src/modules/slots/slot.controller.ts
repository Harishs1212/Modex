import { Request, Response } from 'express';
import { SlotService } from './slot.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../middleware/error.middleware';
import { AuthRequest } from '../../middleware/auth.middleware';

const slotService = new SlotService();

export class SlotController {
  /**
   * Create a new slot (Admin/Doctor only)
   */
  createSlot = asyncHandler(async (req: Request, res: Response) => {
    const slot = await slotService.createSlot(req.body);
    res.status(201).json({
      success: true,
      data: slot,
    });
  });

  /**
   * Update slot (Admin/Doctor only)
   */
  updateSlot = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const slot = await slotService.updateSlot(id, req.body);
    res.json({
      success: true,
      data: slot,
    });
  });

  /**
   * Delete slot (Admin/Doctor only)
   */
  deleteSlot = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await slotService.deleteSlot(id);
    res.json({
      success: true,
      message: 'Slot deleted successfully',
    });
  });

  /**
   * Get slots with filtering
   */
  getSlots = asyncHandler(async (req: Request, res: Response) => {
    const result = await slotService.getSlots(req.query as any);
    res.json({
      success: true,
      ...result,
    });
  });

  /**
   * Get single slot by ID
   */
  getSlotById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const slot = await slotService.getSlotById(id);
    res.json({
      success: true,
      data: slot,
    });
  });

  /**
   * Book a slot (Patient only)
   */
  bookSlot = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    if (!authReq.userId) {
      throw new AppError('User not authenticated', 401);
    }
    const patientId = authReq.userId;
    const appointment = await slotService.bookSlot(patientId, req.body);
    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Slot booked successfully',
    });
  });

  /**
   * Move patient to another slot (Admin only)
   */
  movePatientToSlot = asyncHandler(async (req: Request, res: Response) => {
    const adminId = (req as any).user.id;
    const appointment = await slotService.movePatientToSlot(adminId, req.body);
    res.json({
      success: true,
      data: appointment,
      message: 'Patient moved to new slot successfully',
    });
  });

  /**
   * Get available slots for a doctor on a date
   */
  getAvailableSlots = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      throw new AppError('doctorId and date are required', 400);
    }

    const slots = await slotService.getAvailableSlots(
      doctorId as string,
      date as string
    );
    
    res.json({
      success: true,
      data: slots,
    });
  });
}

