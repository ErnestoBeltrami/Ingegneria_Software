import logger from '../config/logger.js';
import { CategoriaIniziativa } from '../models/categoria_iniziativa.js';

const CATEGORIE_DEFAULT = [
  'Ambiente',
  'Mobilità',
  'Sport',
  'Sicurezza',
  'Verde',
  'Cultura',
];

export const seedCategorie = async () => {
  const ops = CATEGORIE_DEFAULT.map((nome) => ({
    updateOne: {
      filter: { nome },
      update: { $setOnInsert: { nome } },
      upsert: true,
    },
  }));
  const result = await CategoriaIniziativa.bulkWrite(ops);
  if (result.upsertedCount > 0) {
    logger.info(`${result.upsertedCount} categorie di default create`);
  } else {
    logger.info('Categorie già presenti');
  }
};
