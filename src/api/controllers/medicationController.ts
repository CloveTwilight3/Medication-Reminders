// src/api/controllers/medicationController.ts
import { Request, Response, NextFunction } from 'express';
import { medicationService } from '../services/medicationService';
import { ApiResponse } from '../types';

export class MedicationController {
  async getUserMedications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const medications = await medicationService.getUserMedications(userId);
      
      const response: ApiResponse = {
        success: true,
        data: medications
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMedication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, medName } = req.params;
      const medication = await medicationService.getMedication(userId, medName);
      
      if (!medication) {
        res.status(404).json({
          success: false,
          error: 'Medication not found'
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: medication
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createMedication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { name, time } = req.body;
      
      const medication = await medicationService.createMedication({
        userId,
        name,
        time
      });
      
      const response: ApiResponse = {
        success: true,
        data: medication,
        message: 'Medication created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateMedication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, medName } = req.params;
      const updates = req.body;
      
      const medication = await medicationService.updateMedication(userId, medName, updates);
      
      const response: ApiResponse = {
        success: true,
        data: medication,
        message: 'Medication updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteMedication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, medName } = req.params;
      await medicationService.deleteMedication(userId, medName);
      
      const response: ApiResponse = {
        success: true,
        message: 'Medication deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async markTaken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, medName } = req.params;
      await medicationService.markTaken(userId, medName);
      
      const response: ApiResponse = {
        success: true,
        message: 'Medication marked as taken'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async markNotTaken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, medName } = req.params;
      await medicationService.markNotTaken(userId, medName);
      
      const response: ApiResponse = {
        success: true,
        message: 'Medication marked as not taken'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getDueMedications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dueMedications = await medicationService.getMedicationsDueNow();
      
      const response: ApiResponse = {
        success: true,
        data: dueMedications
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async resetDaily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await medicationService.resetDaily();
      
      const response: ApiResponse = {
        success: true,
        message: 'Daily medications reset successfully'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const medicationController = new MedicationController();