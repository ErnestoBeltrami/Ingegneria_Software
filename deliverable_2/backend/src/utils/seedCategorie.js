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
  const esistenti = await CategoriaIniziativa.countDocuments();
  if (esistenti > 0) {
    console.log(`Categorie già presenti (${esistenti})`);
    return;
  }
  await CategoriaIniziativa.insertMany(CATEGORIE_DEFAULT.map((nome) => ({ nome })));
  console.log(`${CATEGORIE_DEFAULT.length} categorie di default create`);
};
