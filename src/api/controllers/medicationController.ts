/** src/api/controllers/medicationController.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

import { Request, Response, NextFunction } from 'express';
import { medicationService } from '../services/medicationService';
import { ApiResponse } from '../types';

export class MedicationController {
  async getUserMedications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { uid } = req.params;
      const medications = await medicationService.getUserMedications(uid);
      
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
      const { uid, medName } = req.params;
      const medication = await medicationService.getMedication(uid, medName);
      
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
      const { uid } = req.params;
      const { name, time, frequency, dose, amount, instructions } = req.body;
      
      const medication = await medicationService.createMedication({
        uid,
        name,
        time,
        frequency,
        dose,
        amount,
        instructions
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
      const { uid, medName } = req.params;
      const updates = req.body;
      
      const medication = await medicationService.updateMedication(uid, medName, updates);
      
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
      const { uid, medName } = req.params;
      await medicationService.deleteMedication(uid, medName);
      
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
      const { uid, medName } = req.params;
      await medicationService.markTaken(uid, medName);
      
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
      const { uid, medName } = req.params;
      await medicationService.markNotTaken(uid, medName);
      
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