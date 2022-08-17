const Joi = require('joi');

const pelaporanScheme = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  namaAnak: Joi.string().required(),
  jenisKelamin: Joi.string().valid('L', 'P').required(),
  anakKeBerapa: Joi.number().required(),
  nik: Joi.string().required(),
  tanggalLahir: Joi.date().iso().required(),
  alamat: Joi.string().required(),
  rt: Joi.string().required(),
  rw: Joi.string().required(),
  provinsi: Joi.string().equal('KALIMANTAN SELATAN').required(),
  kabupatenKota: Joi.string().equal('KAB TABALONG').required(),
  kecamatan: Joi.string().equal('KELUA').required(),
  desaKelurahan: Joi.string().valid(
    'TELAGA ITAR',
    'PUDAK SETEGAL',
    'TAKULAT',
    'PULAU',
    'MASINTAN',
    'PALIAT',
    'SUNGAI BULUH',
    'AMPUKUNG',
  ).required(),
  tanggalPengukuran: Joi.date().iso().required(),
  beratBadan: Joi.number().required(),
  tinggiBadan: Joi.number().required(),
  namaOrangTua: Joi.string().required(),
  noWaPelapor: Joi.string().required(),
});

exports.pelaporanScheme = pelaporanScheme;
