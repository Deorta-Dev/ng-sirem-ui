/**
 * Datos de dominio compartidos por las demos de módulos ERP
 * (`section: 'paginas'`, categorías Ventas, Compras, Finanzas, Inventario,
 * Contabilidad, Nómina y Firma Contable).
 *
 * Son mocks en memoria: no hay backend. Cada página filtra, ordena o
 * transforma estos arrays con signals y refresca la vista. Se centralizan
 * aquí para que las 29 pantallas hablen del mismo cliente, los mismos SKU
 * y los mismos números, y para que la demo sea coherente al navegar.
 */

/* ------------------------------------------------------------------ */
/* Terceros                                                            */
/* ------------------------------------------------------------------ */

/** Estado comercial de un tercero. */
export type ErpEstadoTercero = 'Activo' | 'Inactivo' | 'En mora';

export type ErpTercero = {
  id: number;
  nit: string;
  nombre: string;
  ciudad: string;
  contacto: string;
  telefono: string;
  estado: ErpEstadoTercero;
};

/** Clientes para ventas, cuentas por cobrar y portafolio. */
export const CLIENTES: ErpTercero[] = [
  {
    id: 1,
    nit: '900.123.456-7',
    nombre: 'Distribuciones El Roble S.A.S.',
    ciudad: 'Bogotá',
    contacto: 'Laura Méndez',
    telefono: '310 456 7890',
    estado: 'Activo',
  },
  {
    id: 2,
    nit: '830.456.789-1',
    nombre: 'Comercializadora Andina Ltda.',
    ciudad: 'Medellín',
    contacto: 'Carlos Ríos',
    telefono: '315 222 3344',
    estado: 'En mora',
  },
  {
    id: 3,
    nit: '901.789.321-2',
    nombre: 'Servicios Integrales del Caribe S.A.',
    ciudad: 'Barranquilla',
    contacto: 'Diana Pardo',
    telefono: '300 777 1212',
    estado: 'Activo',
  },
  {
    id: 4,
    nit: '800.222.333-4',
    nombre: 'Ferretería La Esperanza',
    ciudad: 'Cali',
    contacto: 'Jorge Silva',
    telefono: '320 111 9090',
    estado: 'Activo',
  },
  {
    id: 5,
    nit: '900.555.666-9',
    nombre: 'Alimentos del Valle S.A.S.',
    ciudad: 'Bucaramanga',
    contacto: 'Paula Nieto',
    telefono: '318 909 8080',
    estado: 'Inactivo',
  },
];

/** Proveedores con su configuración tributaria de retenciones. */
export type ErpProveedor = ErpTercero & {
  /** Aplica retención en la fuente sobre servicios. */
  retefuente: boolean;
  /** Aplica ReteICA municipal. */
  reteica: boolean;
  /** Aplica ReteIVA en compras. */
  reteiva: boolean;
  /** Concepto de retención predominante. */
  concepto: string;
};

export const PROVEEDORES: ErpProveedor[] = [
  {
    id: 1,
    nit: '800.111.222-3',
    nombre: 'Papelería Central S.A.S.',
    ciudad: 'Bogotá',
    contacto: 'Mónica Díaz',
    telefono: '601 444 5566',
    estado: 'Activo',
    retefuente: true,
    reteica: true,
    reteiva: false,
    concepto: 'Servicios generales (3.5%)',
  },
  {
    id: 2,
    nit: '900.333.444-5',
    nombre: 'Transportes Gran Colombia',
    ciudad: 'Bogotá',
    contacto: 'Iván Castro',
    telefono: '601 777 8899',
    estado: 'Activo',
    retefuente: true,
    reteica: true,
    reteiva: true,
    concepto: 'Transporte de carga (1%)',
  },
  {
    id: 3,
    nit: '830.666.777-8',
    nombre: 'Insumos Médicos Andinos',
    ciudad: 'Medellín',
    contacto: 'Rocío Vargas',
    telefono: '604 321 0987',
    estado: 'Activo',
    retefuente: false,
    reteica: true,
    reteiva: false,
    concepto: 'Compra de mercancía (0%)',
  },
  {
    id: 4,
    nit: '901.888.999-0',
    nombre: 'Tecnología y Redes S.A.S.',
    ciudad: 'Bogotá',
    contacto: 'Andrés Gómez',
    telefono: '601 555 4433',
    estado: 'En mora',
    retefuente: true,
    reteica: false,
    reteiva: true,
    concepto: 'Servicios de software (5%)',
  },
];

/* ------------------------------------------------------------------ */
/* Inventario                                                          */
/* ------------------------------------------------------------------ */

export type ErpBodega = {
  id: string;
  nombre: string;
  ciudad: string;
  tipo: 'Principal' | 'Virtual' | 'Punto de venta';
};

export const BODEGAS: ErpBodega[] = [
  { id: 'bog', nombre: 'Bodega Bogotá', ciudad: 'Bogotá', tipo: 'Principal' },
  { id: 'med', nombre: 'Bodega Medellín', ciudad: 'Medellín', tipo: 'Principal' },
  { id: 'pos', nombre: 'Mostrador', ciudad: 'Bogotá', tipo: 'Punto de venta' },
  { id: 'tra', nombre: 'Tránsito', ciudad: 'En ruta', tipo: 'Virtual' },
];

export type ErpProducto = {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  unidad: string;
  /** Costo promedio ponderado. */
  costo: number;
  precioMayor: number;
  precioDetal: number;
  /** Existencias por bodega (id de `BODEGAS`). */
  stock: Record<string, number>;
  /** Punto de reorden que dispara la alerta de stock bajo. */
  minimo: number;
};

const producto = (
  id: number,
  sku: string,
  nombre: string,
  categoria: string,
  costo: number,
  precioMayor: number,
  precioDetal: number,
  stock: Record<string, number>,
  minimo: number,
): ErpProducto => ({
  id,
  sku,
  nombre,
  categoria,
  unidad: 'UND',
  costo,
  precioMayor,
  precioDetal,
  stock,
  minimo,
});

export const PRODUCTOS: ErpProducto[] = [
  producto(1, 'SKU-1001', 'Tóner láser negro 85A', 'Impresión', 78000, 118000, 149900, { bog: 42, med: 12, pos: 3, tra: 0 }, 15),
  producto(2, 'SKU-1002', 'Papel carta (paq. 500)', 'Papelería', 14500, 22000, 27900, { bog: 320, med: 96, pos: 40, tra: 24 }, 80),
  producto(3, 'SKU-1003', 'Monitor 24" LED', 'Tecnología', 480000, 645000, 799000, { bog: 18, med: 5, pos: 1, tra: 2 }, 6),
  producto(4, 'SKU-1004', 'Silla ergonómica oficina', 'Mobiliario', 310000, 430000, 529000, { bog: 11, med: 4, pos: 0, tra: 0 }, 5),
  producto(5, 'SKU-1005', 'Tinta recargable cyan', 'Impresión', 26000, 39500, 49900, { bog: 64, med: 21, pos: 8, tra: 6 }, 25),
  producto(6, 'SKU-1006', 'Disco SSD 1 TB', 'Tecnología', 185000, 254000, 319000, { bog: 27, med: 9, pos: 2, tra: 0 }, 10),
  producto(7, 'SKU-1007', 'Resma reciclada 75 g', 'Papelería', 12800, 19000, 24500, { bog: 210, med: 74, pos: 36, tra: 12 }, 60),
  producto(8, 'SKU-1008', 'Cable UTP Cat 6 (305 m)', 'Tecnología', 395000, 520000, 649000, { bog: 7, med: 2, pos: 0, tra: 1 }, 4),
];

/** Existencia total sumando todas las bodegas. */
export function stockTotal(producto_: ErpProducto): number {
  return Object.values(producto_.stock).reduce((total, n) => total + n, 0);
}

/** Lista de precios disponible. */
export type ErpLista = 'mayor' | 'detal';

export const LISTAS_PRECIOS: { value: ErpLista; label: string }[] = [
  { value: 'mayor', label: 'Mayorista' },
  { value: 'detal', label: 'Detal' },
];

/* ------------------------------------------------------------------ */
/* Ventas                                                              */
/* ------------------------------------------------------------------ */

/** Estados de un documento frente a la DIAN. */
export type ErpEstadoDian =
  | 'Borrador'
  | 'Validada'
  | 'Transmitida'
  | 'Aceptada'
  | 'Rechazada';

export type ErpTipoDocumentoVenta = 'Factura' | 'Nota crédito' | 'Nota débito';

export type ErpDocumentoVenta = {
  id: number;
  numero: string;
  tipo: ErpTipoDocumentoVenta;
  tercero: string;
  nit: string;
  fecha: string;
  vence: string;
  total: number;
  saldo: number;
  estadoDian: ErpEstadoDian;
  /** Motivo de la nota (crédito/débito), si aplica. */
  motivo?: string;
};

export const DOCUMENTOS_VENTA: ErpDocumentoVenta[] = [
  { id: 1, numero: 'FV-10482', tipo: 'Factura', tercero: 'Distribuciones El Roble S.A.S.', nit: '900.123.456-7', fecha: '2026-09-28', vence: '2026-10-28', total: 4820000, saldo: 4820000, estadoDian: 'Aceptada' },
  { id: 2, numero: 'FV-10483', tipo: 'Factura', tercero: 'Comercializadora Andina Ltda.', nit: '830.456.789-1', fecha: '2026-09-27', vence: '2026-09-27', total: 1375000, saldo: 1375000, estadoDian: 'Transmitida' },
  { id: 3, numero: 'FV-10484', tipo: 'Factura', tercero: 'Servicios Integrales del Caribe S.A.', nit: '901.789.321-2', fecha: '2026-09-25', vence: '2026-10-25', total: 9680000, saldo: 3200000, estadoDian: 'Aceptada' },
  { id: 4, numero: 'NC-00231', tipo: 'Nota crédito', tercero: 'Ferretería La Esperanza', nit: '800.222.333-4', fecha: '2026-09-24', vence: '2026-09-24', total: 420000, saldo: 0, estadoDian: 'Aceptada', motivo: 'Devolución de mercancía dañada' },
  { id: 5, numero: 'FV-10485', tipo: 'Factura', tercero: 'Alimentos del Valle S.A.S.', nit: '900.555.666-9', fecha: '2026-09-22', vence: '2026-10-22', total: 2140000, saldo: 2140000, estadoDian: 'Rechazada' },
  { id: 6, numero: 'ND-00078', tipo: 'Nota débito', tercero: 'Comercializadora Andina Ltda.', nit: '830.456.789-1', fecha: '2026-09-20', vence: '2026-09-20', total: 186000, saldo: 186000, estadoDian: 'Validada' },
  { id: 7, numero: 'FV-10486', tipo: 'Factura', tercero: 'Distribuciones El Roble S.A.S.', nit: '900.123.456-7', fecha: '2026-09-15', vence: '2026-09-15', total: 750000, saldo: 750000, estadoDian: 'Borrador' },
  { id: 8, numero: 'FV-10487', tipo: 'Factura', tercero: 'Servicios Integrales del Caribe S.A.', nit: '901.789.321-2', fecha: '2026-08-30', vence: '2026-09-29', total: 5430000, saldo: 5430000, estadoDian: 'Aceptada' },
  { id: 9, numero: 'FV-10488', tipo: 'Factura', tercero: 'Ferretería La Esperanza', nit: '800.222.333-4', fecha: '2026-08-12', vence: '2026-09-11', total: 3080000, saldo: 3080000, estadoDian: 'Aceptada' },
  { id: 10, numero: 'FV-10489', tipo: 'Factura', tercero: 'Comercializadora Andina Ltda.', nit: '830.456.789-1', fecha: '2026-07-20', vence: '2026-08-19', total: 6410000, saldo: 6410000, estadoDian: 'Aceptada' },
];

export type ErpEstadoCotizacion = 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada' | 'Facturada';

export type ErpCotizacion = {
  id: number;
  numero: string;
  cliente: string;
  fecha: string;
  validez: string;
  total: number;
  estado: ErpEstadoCotizacion;
  items: number;
};

export const COTIZACIONES: ErpCotizacion[] = [
  { id: 1, numero: 'COT-0451', cliente: 'Distribuciones El Roble S.A.S.', fecha: '2026-09-29', validez: '2026-10-13', total: 6240000, estado: 'Enviada', items: 5 },
  { id: 2, numero: 'COT-0452', cliente: 'Servicios Integrales del Caribe S.A.', fecha: '2026-09-28', validez: '2026-10-12', total: 1890000, estado: 'Aceptada', items: 3 },
  { id: 3, numero: 'COT-0453', cliente: 'Ferretería La Esperanza', fecha: '2026-09-27', validez: '2026-10-11', total: 945000, estado: 'Borrador', items: 2 },
  { id: 4, numero: 'COT-0454', cliente: 'Comercializadora Andina Ltda.', fecha: '2026-09-24', validez: '2026-10-08', total: 12780000, estado: 'Rechazada', items: 8 },
  { id: 5, numero: 'COT-0455', cliente: 'Alimentos del Valle S.A.S.', fecha: '2026-09-20', validez: '2026-10-04', total: 3150000, estado: 'Facturada', items: 4 },
  { id: 6, numero: 'COT-0456', cliente: 'Distribuciones El Roble S.A.S.', fecha: '2026-09-18', validez: '2026-10-02', total: 780000, estado: 'Aceptada', items: 2 },
];

export type ErpEstadoRemision = 'Pendiente' | 'Despachada' | 'Anulada';

export type ErpRemision = {
  id: number;
  numero: string;
  cliente: string;
  bodega: string;
  fecha: string;
  items: number;
  valor: number;
  estado: ErpEstadoRemision;
};

export const REMISIONES: ErpRemision[] = [
  { id: 1, numero: 'RM-02188', cliente: 'Distribuciones El Roble S.A.S.', bodega: 'Bodega Bogotá', fecha: '2026-09-29', items: 6, valor: 1420000, estado: 'Pendiente' },
  { id: 2, numero: 'RM-02189', cliente: 'Ferretería La Esperanza', bodega: 'Bodega Medellín', fecha: '2026-09-28', items: 3, valor: 640000, estado: 'Despachada' },
  { id: 3, numero: 'RM-02190', cliente: 'Servicios Integrales del Caribe S.A.', bodega: 'Bodega Bogotá', fecha: '2026-09-27', items: 12, valor: 3980000, estado: 'Despachada' },
  { id: 4, numero: 'RM-02191', cliente: 'Alimentos del Valle S.A.S.', bodega: 'Mostrador', fecha: '2026-09-26', items: 1, valor: 149900, estado: 'Anulada' },
  { id: 5, numero: 'RM-02192', cliente: 'Comercializadora Andina Ltda.', bodega: 'Bodega Bogotá', fecha: '2026-09-25', items: 4, valor: 890000, estado: 'Pendiente' },
];

/* ------------------------------------------------------------------ */
/* Compras                                                             */
/* ------------------------------------------------------------------ */

export type ErpEstadoOrden = 'Borrador' | 'Enviada' | 'Recibida' | 'Facturada';

export type ErpOrdenCompra = {
  id: number;
  numero: string;
  proveedor: string;
  fecha: string;
  entrega: string;
  total: number;
  items: number;
  estado: ErpEstadoOrden;
};

export const ORDENES_COMPRA: ErpOrdenCompra[] = [
  { id: 1, numero: 'OC-00712', proveedor: 'Papelería Central S.A.S.', fecha: '2026-09-29', entrega: '2026-10-06', total: 2450000, items: 9, estado: 'Enviada' },
  { id: 2, numero: 'OC-00713', proveedor: 'Insumos Médicos Andinos', fecha: '2026-09-28', entrega: '2026-10-04', total: 5120000, items: 4, estado: 'Recibida' },
  { id: 3, numero: 'OC-00714', proveedor: 'Tecnología y Redes S.A.S.', fecha: '2026-09-26', entrega: '2026-10-10', total: 8730000, items: 6, estado: 'Facturada' },
  { id: 4, numero: 'OC-00715', proveedor: 'Transportes Gran Colombia', fecha: '2026-09-25', entrega: '2026-09-30', total: 680000, items: 1, estado: 'Borrador' },
  { id: 5, numero: 'OC-00716', proveedor: 'Papelería Central S.A.S.', fecha: '2026-09-22', entrega: '2026-09-29', total: 1180000, items: 5, estado: 'Recibida' },
];

export type ErpEstadoRadian = 'Recibida' | 'Acuse enviado' | 'Aceptada' | 'Rechazada';

export type ErpFacturaCompra = {
  id: number;
  numero: string;
  proveedor: string;
  nit: string;
  fecha: string;
  vence: string;
  total: number;
  estado: ErpEstadoRadian;
};

export const FACTURAS_COMPRA: ErpFacturaCompra[] = [
  { id: 1, numero: 'FP-30211', proveedor: 'Papelería Central S.A.S.', nit: '800.111.222-3', fecha: '2026-09-29', vence: '2026-10-29', total: 2450000, estado: 'Recibida' },
  { id: 2, numero: 'FCE-88421', proveedor: 'Transportes Gran Colombia', nit: '900.333.444-5', fecha: '2026-09-27', vence: '2026-10-11', total: 680000, estado: 'Acuse enviado' },
  { id: 3, numero: 'FCE-88422', proveedor: 'Insumos Médicos Andinos', nit: '830.666.777-8', fecha: '2026-09-24', vence: '2026-10-24', total: 5120000, estado: 'Aceptada' },
  { id: 4, numero: 'FCE-88423', proveedor: 'Tecnología y Redes S.A.S.', nit: '901.888.999-0', fecha: '2026-09-21', vence: '2026-10-05', total: 8730000, estado: 'Rechazada' },
  { id: 5, numero: 'FCE-88424', proveedor: 'Papelería Central S.A.S.', nit: '800.111.222-3', fecha: '2026-09-15', vence: '2026-10-15', total: 1180000, estado: 'Aceptada' },
];

/** Conceptos de retención configurables. */
export type ErpConceptoRetencion = {
  id: string;
  nombre: string;
  tarifa: number;
  base: string;
  aplica: 'ReteFuente' | 'ReteICA' | 'ReteIVA';
};

export const CONCEPTOS_RETENCION: ErpConceptoRetencion[] = [
  { id: 'serv', nombre: 'Servicios generales', tarifa: 3.5, base: 'Honorarios y servicios', aplica: 'ReteFuente' },
  { id: 'trans', nombre: 'Transporte de carga', tarifa: 1, base: 'Servicio de transporte', aplica: 'ReteFuente' },
  { id: 'soft', nombre: 'Servicios de software', tarifa: 5, base: 'Derechos de autor y software', aplica: 'ReteFuente' },
  { id: 'ica', nombre: 'ReteICA municipal', tarifa: 4.14, base: 'Compras y servicios', aplica: 'ReteICA' },
  { id: 'iva', nombre: 'ReteIVA 15%', tarifa: 15, base: 'IVA facturado', aplica: 'ReteIVA' },
];

/* ------------------------------------------------------------------ */
/* Tesorería                                                           */
/* ------------------------------------------------------------------ */

export type ErpTipoCuenta = 'Banco' | 'Caja';
export type ErpMoneda = 'COP' | 'USD';

export type ErpCuenta = {
  id: number;
  codigo: string;
  nombre: string;
  banco: string;
  tipo: ErpTipoCuenta;
  moneda: ErpMoneda;
  numero: string;
  saldo: number;
};

export const CUENTAS_TESORERIA: ErpCuenta[] = [
  { id: 1, codigo: '1110-05', nombre: 'Banco Bogotá corriente', banco: 'Banco de Bogotá', tipo: 'Banco', moneda: 'COP', numero: '4587120936', saldo: 48250000 },
  { id: 2, codigo: '1110-05', nombre: 'Bancolombia ahorro', banco: 'Bancolombia', tipo: 'Banco', moneda: 'COP', numero: '9710045512', saldo: 19380000 },
  { id: 3, codigo: '1110-10', nombre: 'Dólares BBVA', banco: 'BBVA Colombia', tipo: 'Banco', moneda: 'USD', numero: '2045887123', saldo: 6420 },
  { id: 4, codigo: '1115-01', nombre: 'Caja menor Bogotá', banco: '—', tipo: 'Caja', moneda: 'COP', numero: 'CAJA-01', saldo: 1240000 },
  { id: 5, codigo: '1115-01', nombre: 'Caja Mostrador', banco: '—', tipo: 'Caja', moneda: 'COP', numero: 'CAJA-02', saldo: 860000 },
];

export type ErpMovimientoBancario = {
  id: number;
  fecha: string;
  descripcion: string;
  referencia: string;
  valor: number;
  /** `true` cuando ya está emparejado con un comprobante del sistema. */
  conciliado: boolean;
  /** Comprobante emparejado, si existe. */
  comprobante: string | null;
};

export const MOVIMIENTOS_BANCARIOS: ErpMovimientoBancario[] = [
  { id: 1, fecha: '2026-09-29', descripcion: 'Consignación cliente El Roble', referencia: 'CONS-77812', valor: 4820000, conciliado: true, comprobante: 'RC-00451' },
  { id: 2, fecha: '2026-09-28', descripcion: 'Pago proveedor Papelería Central', referencia: 'PSE-3341', valor: -2450000, conciliado: true, comprobante: 'CE-00122' },
  { id: 3, fecha: '2026-09-27', descripcion: 'Transferencia recibida', referencia: 'TRF-9910', valor: 3200000, conciliado: false, comprobante: null },
  { id: 4, fecha: '2026-09-26', descripcion: 'Servicio bancario manejo cuenta', referencia: 'BAC-1120', valor: -38000, conciliado: false, comprobante: null },
  { id: 5, fecha: '2026-09-25', descripcion: 'Cobro factura FV-10484', referencia: 'DEP-5540', valor: 6480000, conciliado: true, comprobante: 'RC-00450' },
  { id: 6, fecha: '2026-09-24', descripcion: 'Nómina septiembre', referencia: 'NOM-0926', valor: -18750000, conciliado: true, comprobante: 'CE-00121' },
  { id: 7, fecha: '2026-09-23', descripcion: 'Retención en la fuente', referencia: 'RET-2210', valor: -142000, conciliado: false, comprobante: null },
];

export type ErpTransferencia = {
  id: number;
  fecha: string;
  origen: string;
  destino: string;
  valor: number;
  estado: 'Completada' | 'Pendiente';
};

export const TRANSFERENCIAS: ErpTransferencia[] = [
  { id: 1, fecha: '2026-09-29', origen: 'Bancolombia ahorro', destino: 'Caja menor Bogotá', valor: 1500000, estado: 'Completada' },
  { id: 2, fecha: '2026-09-27', origen: 'Banco Bogotá corriente', destino: 'Bancolombia ahorro', valor: 4000000, estado: 'Completada' },
  { id: 3, fecha: '2026-09-26', origen: 'Caja Mostrador', destino: 'Banco Bogotá corriente', valor: 860000, estado: 'Completada' },
  { id: 4, fecha: '2026-09-30', origen: 'Banco Bogotá corriente', destino: 'Dólares BBVA', valor: 400, estado: 'Pendiente' },
];

/* ------------------------------------------------------------------ */
/* Contabilidad                                                        */
/* ------------------------------------------------------------------ */

export type ErpTipoCuentaPuc = 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Gasto';

export type ErpCuentaPuc = {
  id: number;
  codigo: string;
  nombre: string;
  nivel: 1 | 2 | 3;
  tipo: ErpTipoCuentaPuc;
  /** Naturaleza débito/crédito. */
  naturaleza: 'Débito' | 'Crédito';
  movimiento: boolean;
};

export const CUENTAS_PUC: ErpCuentaPuc[] = [
  { id: 1, codigo: '1', nombre: 'ACTIVO', nivel: 1, tipo: 'Activo', naturaleza: 'Débito', movimiento: false },
  { id: 2, codigo: '11', nombre: 'ACTIVO CORRIENTE', nivel: 2, tipo: 'Activo', naturaleza: 'Débito', movimiento: false },
  { id: 3, codigo: '1105', nombre: 'Bancos', nivel: 3, tipo: 'Activo', naturaleza: 'Débito', movimiento: true },
  { id: 4, codigo: '110505', nombre: 'Banco de Bogotá', nivel: 3, tipo: 'Activo', naturaleza: 'Débito', movimiento: true },
  { id: 5, codigo: '1305', nombre: 'Clientes nacionales', nivel: 3, tipo: 'Activo', naturaleza: 'Débito', movimiento: true },
  { id: 6, codigo: '1408', nombre: 'Inventarios de mercancía', nivel: 3, tipo: 'Activo', naturaleza: 'Débito', movimiento: true },
  { id: 7, codigo: '2', nombre: 'PASIVO', nivel: 1, tipo: 'Pasivo', naturaleza: 'Crédito', movimiento: false },
  { id: 8, codigo: '2205', nombre: 'Proveedores nacionales', nivel: 3, tipo: 'Pasivo', naturaleza: 'Crédito', movimiento: true },
  { id: 9, codigo: '2365', nombre: 'Retención en la fuente practicada', nivel: 3, tipo: 'Pasivo', naturaleza: 'Crédito', movimiento: true },
  { id: 10, codigo: '3', nombre: 'PATRIMONIO', nivel: 1, tipo: 'Patrimonio', naturaleza: 'Crédito', movimiento: false },
  { id: 11, codigo: '4', nombre: 'INGRESOS', nivel: 1, tipo: 'Ingreso', naturaleza: 'Crédito', movimiento: false },
  { id: 12, codigo: '4135', nombre: 'Ingresos de operación', nivel: 3, tipo: 'Ingreso', naturaleza: 'Crédito', movimiento: true },
  { id: 13, codigo: '5', nombre: 'GASTOS', nivel: 1, tipo: 'Gasto', naturaleza: 'Débito', movimiento: false },
  { id: 14, codigo: '5135', nombre: 'Costo de mercancía vendida', nivel: 3, tipo: 'Gasto', naturaleza: 'Débito', movimiento: true },
  { id: 15, codigo: '5205', nombre: 'Gastos operacionales', nivel: 3, tipo: 'Gasto', naturaleza: 'Débito', movimiento: true },
];

export type ErpLineaAsiento = {
  cuenta: string;
  nombre: string;
  debe: number;
  haber: number;
};

export type ErpAsiento = {
  id: number;
  numero: string;
  fecha: string;
  concepto: string;
  origen: 'Ventas' | 'Compras' | 'Tesorería' | 'Manual';
  estado: 'Borrador' | 'Publicado';
  lineas: ErpLineaAsiento[];
};

const asiento = (
  id: number,
  numero: string,
  fecha: string,
  concepto: string,
  origen: ErpAsiento['origen'],
  estado: ErpAsiento['estado'],
  lineas: ErpLineaAsiento[],
): ErpAsiento => ({ id, numero, fecha, concepto, origen, estado, lineas });

export const ASIENTOS: ErpAsiento[] = [
  asiento(1, 'CE-00841', '2026-09-28', 'Factura FV-10483', 'Ventas', 'Publicado', [
    { cuenta: '1305', nombre: 'Clientes nacionales', debe: 1375000, haber: 0 },
    { cuenta: '4135', nombre: 'Ingresos de operación', debe: 0, haber: 1155462 },
    { cuenta: '2365', nombre: 'Retención en la fuente practicada', debe: 0, haber: 48125 },
    { cuenta: '2408', nombre: 'IVA cobrado', debe: 0, haber: 171413 },
  ]),
  asiento(2, 'CE-00842', '2026-09-27', 'Compra FP-30211', 'Compras', 'Publicado', [
    { cuenta: '1408', nombre: 'Inventarios de mercancía', debe: 2450000, haber: 0 },
    { cuenta: '2205', nombre: 'Proveedores nacionales', debe: 0, haber: 2450000 },
  ]),
  asiento(3, 'CE-00843', '2026-09-27', 'Transferencia entre cuentas', 'Tesorería', 'Publicado', [
    { cuenta: '1105', nombre: 'Bancos', debe: 4000000, haber: 0 },
    { cuenta: '1105', nombre: 'Bancos', debe: 0, haber: 4000000 },
  ]),
  asiento(4, 'CE-00844', '2026-09-30', 'Depreciación del mes', 'Manual', 'Borrador', [
    { cuenta: '5205', nombre: 'Gastos operacionales', debe: 620000, haber: 0 },
    { cuenta: '1504', nombre: 'Depreciación acumulada', debe: 0, haber: 620000 },
  ]),
  asiento(5, 'CE-00845', '2026-09-30', 'Nómina septiembre', 'Tesorería', 'Borrador', [
    { cuenta: '5205', nombre: 'Gastos operacionales', debe: 18750000, haber: 0 },
    { cuenta: '1105', nombre: 'Bancos', debe: 0, haber: 15730000 },
    { cuenta: '2365', nombre: 'Retención en la fuente practicada', debe: 0, haber: 420000 },
    { cuenta: '2408', nombre: 'Aportes a seguridad social', debe: 0, haber: 2600000 },
  ]),
];

/** Estados de un periodo contable. */
export type ErpEstadoPeriodo = 'Abierto' | 'Cerrado' | 'En cierre';

export type ErpPeriodo = {
  id: string;
  label: string;
  estado: ErpEstadoPeriodo;
  asientos: number;
  ingresos: number;
  gastos: number;
};

export const PERIODOS: ErpPeriodo[] = [
  { id: '2026-07', label: 'Julio 2026', estado: 'Cerrado', asientos: 142, ingresos: 48200000, gastos: 36100000 },
  { id: '2026-08', label: 'Agosto 2026', estado: 'Cerrado', asientos: 158, ingresos: 52700000, gastos: 39400000 },
  { id: '2026-09', label: 'Septiembre 2026', estado: 'En cierre', asientos: 171, ingresos: 61300000, gastos: 44800000 },
  { id: '2026-10', label: 'Octubre 2026', estado: 'Abierto', asientos: 24, ingresos: 9600000, gastos: 6200000 },
];

/** Formatos de información exógena / medios magnéticos. */
export type ErpFormatoTributario = {
  id: number;
  codigo: string;
  nombre: string;
  periodo: string;
  estado: 'Pendiente' | 'Generado' | 'Presentado';
  registros: number;
};

export const FORMATOS_TRIBUTARIOS: ErpFormatoTributario[] = [
  { id: 1, codigo: '1005', nombre: 'Información exógena de ingresos', periodo: '2025', estado: 'Generado', registros: 1842 },
  { id: 2, codigo: '1012', nombre: 'Información de compras', periodo: '2025', estado: 'Pendiente', registros: 0 },
  { id: 3, codigo: '1176', nombre: 'Medios magnéticos DIAN', periodo: '2025', estado: 'Presentado', registros: 3260 },
  { id: 4, codigo: '2099', nombre: 'Informe de retenciones', periodo: '2026-08', estado: 'Generado', registros: 128 },
  { id: 5, codigo: 'F-220', nombre: 'Autolectoría IVA', periodo: '2026-08', estado: 'Pendiente', registros: 0 },
];

/* ------------------------------------------------------------------ */
/* Nómina                                                              */
/* ------------------------------------------------------------------ */

export type ErpEmpleado = {
  id: number;
  documento: string;
  nombre: string;
  cargo: string;
  salario: number;
  eps: string;
  fondoPension: string;
  arl: string;
  fechaIngreso: string;
  estado: 'Activo' | 'Licencia' | 'Retirado';
};

export const EMPLEADOS: ErpEmpleado[] = [
  { id: 1, documento: 'CC 80.123.456', nombre: 'María Fernanda Torres', cargo: 'Contadora general', salario: 4800000, eps: 'Sanitas', fondoPension: 'Porvenir', arl: 'Positiva', fechaIngreso: '2021-03-15', estado: 'Activo' },
  { id: 2, documento: 'CC 71.456.789', nombre: 'Carlos Andrés Ríos', cargo: 'Analista de impuestos', salario: 3600000, eps: 'Sura', fondoPension: 'Colpensiones', arl: 'Sura', fechaIngreso: '2022-08-01', estado: 'Activo' },
  { id: 3, documento: 'CC 1.023.445', nombre: 'Laura Sofía Méndez', cargo: 'Auxiliar contable', salario: 2200000, eps: 'Nueva EPS', fondoPension: 'Skandia', arl: 'Positiva', fechaIngreso: '2023-06-12', estado: 'Activo' },
  { id: 4, documento: 'CC 103.556.78', nombre: 'Jorge Eliécer Silva', cargo: 'Tesorería', salario: 3100000, eps: 'Sanitas', fondoPension: 'Porvenir', arl: 'Sura', fechaIngreso: '2020-11-20', estado: 'Licencia' },
  { id: 5, documento: 'CC 1.287.334', nombre: 'Diana Carolina Pardo', cargo: 'Gerente administrativa', salario: 6500000, eps: 'Sura', fondoPension: 'Colpensiones', arl: 'Positiva', fechaIngreso: '2019-02-04', estado: 'Activo' },
];

export type ErpLiquidacion = {
  id: number;
  empleado: string;
  cargo: string;
  salario: number;
  horasExtras: number;
  comisiones: number;
  salud: number;
  pension: number;
  retencion: number;
  neto: number;
};

/** Devengados y deducciones de la quincena vigente. */
export const LIQUIDACION_NOMINA: ErpLiquidacion[] = [
  { id: 1, empleado: 'María Fernanda Torres', cargo: 'Contadora general', salario: 2400000, horasExtras: 0, comisiones: 180000, salud: 96000, pension: 96000, retencion: 78000, neto: 2310000 },
  { id: 2, empleado: 'Carlos Andrés Ríos', cargo: 'Analista de impuestos', salario: 1800000, horasExtras: 145000, comisiones: 0, salud: 72000, pension: 72000, retencion: 0, neto: 1801000 },
  { id: 3, empleado: 'Laura Sofía Méndez', cargo: 'Auxiliar contable', salario: 1100000, horasExtras: 0, comisiones: 0, salud: 44000, pension: 44000, retencion: 0, neto: 1012000 },
  { id: 4, empleado: 'Jorge Eliécer Silva', cargo: 'Tesorería', salario: 1550000, horasExtras: 0, comisiones: 0, salud: 62000, pension: 62000, retencion: 0, neto: 1426000 },
  { id: 5, empleado: 'Diana Carolina Pardo', cargo: 'Gerente administrativa', salario: 3250000, horasExtras: 0, comisiones: 420000, salud: 130000, pension: 130000, retencion: 196000, neto: 3214000 },
];

export type ErpPrestacion = {
  id: number;
  empleado: string;
  concepto: string;
  periodo: string;
  base: number;
  dias: number;
  valor: number;
  estado: 'Calculado' | 'Devengado' | 'Pagado';
};

export const PRESTACIONES: ErpPrestacion[] = [
  { id: 1, empleado: 'María Fernanda Torres', concepto: 'Prima de servicios', periodo: '2026 S1', base: 4800000, dias: 15, valor: 2400000, estado: 'Devengado' },
  { id: 2, empleado: 'María Fernanda Torres', concepto: 'Cesantías', periodo: '2026 S1', base: 4800000, dias: 15, valor: 2400000, estado: 'Devengado' },
  { id: 3, empleado: 'María Fernanda Torres', concepto: 'Intereses de cesantías', periodo: '2026 S1', base: 2400000, dias: 0, valor: 48000, estado: 'Calculado' },
  { id: 4, empleado: 'Carlos Andrés Ríos', concepto: 'Vacaciones', periodo: '2026', base: 3600000, dias: 15, valor: 1800000, estado: 'Pagado' },
  { id: 5, empleado: 'Carlos Andrés Ríos', concepto: 'Cesantías', periodo: '2026 S1', base: 3600000, dias: 15, valor: 1800000, estado: 'Devengado' },
  { id: 6, empleado: 'Diana Carolina Pardo', concepto: 'Prima de servicios', periodo: '2026 S1', base: 6500000, dias: 15, valor: 3250000, estado: 'Devengado' },
];

export type ErpEstadoNominaDian = 'Borrador' | 'Validada' | 'Transmitida' | 'Aceptada' | 'Rechazada';

export type ErpDocumentoNomina = {
  id: number;
  numero: string;
  periodo: string;
  empleados: number;
  total: number;
  fecha: string;
  estado: ErpEstadoNominaDian;
};

export const DOCUMENTOS_NOMINA: ErpDocumentoNomina[] = [
  { id: 1, numero: 'NOM-2026-09-Q2', periodo: 'Septiembre 2026 · Q2', empleados: 5, total: 9763000, fecha: '2026-09-30', estado: 'Borrador' },
  { id: 2, numero: 'NOM-2026-09-Q1', periodo: 'Septiembre 2026 · Q1', empleados: 5, total: 9763000, fecha: '2026-09-15', estado: 'Aceptada' },
  { id: 3, numero: 'NOM-2026-08-Q2', periodo: 'Agosto 2026 · Q2', empleados: 5, total: 9642000, fecha: '2026-08-31', estado: 'Aceptada' },
  { id: 4, numero: 'NOM-2026-08-Q1', periodo: 'Agosto 2026 · Q1', empleados: 4, total: 7880000, fecha: '2026-08-15', estado: 'Rechazada' },
  { id: 5, numero: 'NAD-2026-08', periodo: 'Nota ajuste · Agosto', empleados: 1, total: -120000, fecha: '2026-08-20', estado: 'Transmitida' },
];

/* ------------------------------------------------------------------ */
/* Firma contable (portafolio multiempresa)                            */
/* ------------------------------------------------------------------ */

export type ErpSaludCliente = 'Sana' | 'Atención' | 'Crítica';

export type ErpEmpresa = {
  id: number;
  nit: string;
  nombre: string;
  sector: string;
  contador: string;
  /** Facturas de venta vencidas sin cobrar (COP). */
  vencidas: number;
  /** Movimientos bancarios sin conciliar. */
  descuadres: number;
  /** Documentos pendientes de transmisión a la DIAN. */
  pendientesDian: number;
  /** Cuentas por pagar vencidas (COP). */
  porPagar: number;
  salud: ErpSaludCliente;
};

export const EMPRESAS_CLIENTES: ErpEmpresa[] = [
  { id: 1, nit: '900.123.456-7', nombre: 'Distribuciones El Roble S.A.S.', sector: 'Comercio mayorista', contador: 'María F. Torres', vencidas: 12400000, descuadres: 3, pendientesDian: 2, porPagar: 4800000, salud: 'Atención' },
  { id: 2, nit: '830.456.789-1', nombre: 'Comercializadora Andina Ltda.', sector: 'Distribución', contador: 'Carlos A. Ríos', vencidas: 6410000, descuadres: 0, pendientesDian: 0, porPagar: 2100000, salud: 'Sana' },
  { id: 3, nit: '901.789.321-2', nombre: 'Servicios Integrales del Caribe S.A.', sector: 'Servicios', contador: 'María F. Torres', vencidas: 5430000, descuadres: 7, pendientesDian: 9, porPagar: 8900000, salud: 'Crítica' },
  { id: 4, nit: '800.222.333-4', nombre: 'Ferretería La Esperanza', sector: 'Comercio detail', contador: 'Laura S. Méndez', vencidas: 3080000, descuadres: 1, pendientesDian: 0, porPagar: 940000, salud: 'Sana' },
  { id: 5, nit: '900.555.666-9', nombre: 'Alimentos del Valle S.A.S.', sector: 'Alimentos', contador: 'Carlos A. Ríos', vencidas: 2140000, descuadres: 2, pendientesDian: 4, porPagar: 6300000, salud: 'Atención' },
];

export type ErpSeveridad = 'Alta' | 'Media' | 'Baja';

export type ErpAlerta = {
  id: number;
  empresa: string;
  tipo: 'Facturas vencidas' | 'Conciliación desajustada' | 'Documentos sin transmitir';
  detalle: string;
  severidad: ErpSeveridad;
  fecha: string;
  resuelta: boolean;
};

export const ALERTAS_SALUD: ErpAlerta[] = [
  { id: 1, empresa: 'Servicios Integrales del Caribe S.A.', tipo: 'Documentos sin transmitir', detalle: '9 facturas de agosto sin enviar a la DIAN', severidad: 'Alta', fecha: '2026-09-30', resuelta: false },
  { id: 2, empresa: 'Servicios Integrales del Caribe S.A.', tipo: 'Conciliación desajustada', detalle: '7 movimientos sin comprobante en Banco Bogotá', severidad: 'Alta', fecha: '2026-09-29', resuelta: false },
  { id: 3, empresa: 'Distribuciones El Roble S.A.S.', tipo: 'Facturas vencidas', detalle: '$12.4 M vencidos con más de 60 días', severidad: 'Alta', fecha: '2026-09-28', resuelta: false },
  { id: 4, empresa: 'Alimentos del Valle S.A.S.', tipo: 'Documentos sin transmitir', detalle: '4 notas crédito pendientes de acuse', severidad: 'Media', fecha: '2026-09-27', resuelta: false },
  { id: 5, empresa: 'Ferretería La Esperanza', tipo: 'Conciliación desajustada', detalle: '1 movimiento de caja sin cuadrar', severidad: 'Baja', fecha: '2026-09-26', resuelta: false },
  { id: 6, empresa: 'Distribuciones El Roble S.A.S.', tipo: 'Conciliación desajustada', detalle: '2 consignaciones sin emparejar', severidad: 'Media', fecha: '2026-09-25', resuelta: true },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Suma de `debe` y `haber` de un asiento. */
export function totalesAsiento(lineas: ErpLineaAsiento[]): { debe: number; haber: number; cuadrado: boolean } {
  const debe = lineas.reduce((acc, l) => acc + l.debe, 0);
  const haber = lineas.reduce((acc, l) => acc + l.haber, 0);
  return { debe, haber, cuadrado: debe === haber };
}

/** Rótulo de corte de aging: `vencimiento` en ISO frente a `hoy`. */
export type ErpBucket = 'Por vencer' | '0-30' | '31-60' | '61-90' | '90+';

export function bucketVencimiento(vence: string, hoy = '2026-09-30'): ErpBucket {
  const dias = Math.round((new Date(hoy).getTime() - new Date(vence).getTime()) / 86_400_000);
  if (dias <= 0) return 'Por vencer';
  if (dias <= 30) return '0-30';
  if (dias <= 60) return '31-60';
  if (dias <= 90) return '61-90';
  return '90+';
}
