// 📄 @fichier: hooks/index.ts
// 🪝 Point d'entrée unifié pour tous les hooks

// Hooks de logique métier
export { useBusinessLogic } from './useBusinessLogic';
export { useRiskManagement } from './useRiskManagement';

// Hooks de store
export { useUnifiedStore, useSimulation, useConfig, useUI, useActions } from '../stores/unifiedStore';
