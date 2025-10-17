// src/api/routes/medicationRoutes.ts
import { Router } from 'express';
import { medicationController } from '../controllers/medicationController';

export const medicationRouter = Router();

// Get medications due now (for scheduler)
medicationRouter.get('/due', (req, res, next) => 
  medicationController.getDueMedications(req, res, next)
);

// Reset daily medications (for scheduler)
medicationRouter.post('/reset-daily', (req, res, next) => 
  medicationController.resetDaily(req, res, next)
);

// User-specific medication routes
medicationRouter.get('/:userId', (req, res, next) => 
  medicationController.getUserMedications(req, res, next)
);

medicationRouter.post('/:userId', (req, res, next) => 
  medicationController.createMedication(req, res, next)
);

medicationRouter.get('/:userId/:medName', (req, res, next) => 
  medicationController.getMedication(req, res, next)
);

medicationRouter.patch('/:userId/:medName', (req, res, next) => 
  medicationController.updateMedication(req, res, next)
);

medicationRouter.delete('/:userId/:medName', (req, res, next) => 
  medicationController.deleteMedication(req, res, next)
);

medicationRouter.post('/:userId/:medName/taken', (req, res, next) => 
  medicationController.markTaken(req, res, next)
);

medicationRouter.post('/:userId/:medName/not-taken', (req, res, next) => 
  medicationController.markNotTaken(req, res, next)
);