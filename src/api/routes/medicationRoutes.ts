/** src/api/routes/medicationRoutes.ts
 * @license MIT
 * Copyright (c) 2025 Clove Twilight
 * See LICENSE file in the root directory for full license text.
 */

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

// User-specific medication routes (using UID)
medicationRouter.get('/:uid', (req, res, next) => 
  medicationController.getUserMedications(req, res, next)
);

medicationRouter.post('/:uid', (req, res, next) => 
  medicationController.createMedication(req, res, next)
);

medicationRouter.get('/:uid/:medName', (req, res, next) => 
  medicationController.getMedication(req, res, next)
);

medicationRouter.patch('/:uid/:medName', (req, res, next) => 
  medicationController.updateMedication(req, res, next)
);

medicationRouter.delete('/:uid/:medName', (req, res, next) => 
  medicationController.deleteMedication(req, res, next)
);

medicationRouter.post('/:uid/:medName/taken', (req, res, next) => 
  medicationController.markTaken(req, res, next)
);

medicationRouter.post('/:uid/:medName/not-taken', (req, res, next) => 
  medicationController.markNotTaken(req, res, next)
);