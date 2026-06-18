// Base de datos estructurada a partir de los documentos PDF y DOCX (Cambios)
const pdfData = {
    pagos: {
    contexto: {
        icon: `🌐`,
        title: `Gestión de Pagos`,
        objetivo: `Garantizar la ejecución correcta, oportuna y controlada de los pagos, asegurando la validación de la información operativa, el cumplimiento de condiciones comerciales y fiscales, y la trazabilidad completa de cada transacción.`,
        alcance: `El proceso de Gestión de Pagos TO-BE abarca la administración integral de los pagos a través de tres flujos operativos diferenciados:
<br> • <b>Flujo A:</b> Pagos a clientes/proveedores de recolección, basados en información operativa proveniente de MUTA, considerando agrupaciones fiscales, ciclos de facturación, donaciones y penalizaciones.  
<br> • <b>Flujo B:</b>  Pagos derivados de compras comerciales a proveedores externos, incluyendo negociación, validación de calidad, recepción de material y control de excepciones como pagos sin factura.  
<br> • <b>Flujo C:</b>  Pagos a proveedores de refacciones, insumos y servicios, integrados al proceso de compras mediante validaciones estructuradas (orden de compra, recepción y factura).  
<br> El alcance incluye desde la validación del origen del pago en cada flujo, pasando por la consolidación, cálculo, documentación y aprobación financiera, hasta la ejecución del pago, registro contable y conciliación, bajo un esquema unificado de control y trazabilidad.`
    },
    proceso: [
        { step: `Flujo A - 0`, title: `Validación Operativa (Antes de extracción)`, actor: `Logística y Recolección`, desc: `Validar en campo:
- Registro de recolección
- Kilos capturados (Netos)
- Evidencias (foto, firma, nombre)
- Dirección correcta`, consid: `• Evidencias obligatorias en MUTA. <br>• Base para confiabilidad del proceso.`, res: `Información operativa validada` },
        { step: `Flujo A - 1`, title: `Extracción de datos desde MUTA`, actor: `Administración`, desc: `Descarga de reporte de recolecciones desde MUTA (Código interno generador, fecha de recolección, estado, dirección, método, tags generador, RFC, kilos(netos/brutos), precio).`, consid: `La extracción debe considerar todos los clientes, agrupados luego por RFC.`, res: `Dataset base de recolecciones` },
        { step: `Flujo A - 2`, title: `Validación operativa (Filtro de registros)`, actor: `Administración`, desc: `• Filtrar registros con estado válido (Completado/Verificado). <br>• Validar integridad de datos (RFC, kilos, precio), no duplicidad, estructura de agrupamiento, RFC en CRM y precio vigente.`, consid: `Inconsistencias no bloquean el pago, se registran como incidencias. Solo las que afectan el monto se resuelven antes del cálculo.`, res: `Registros válidos para procesamiento` },
        { step: `Flujo A - 3`, title: `Consolidación de información`, actor: `Administración`, desc: `• Agrupar información por: Grupo, Cliente, RFC/Agrupamiento, Periodo. <br>Aplicar reglas: <br>•Monto mínimo ($500), <br>•Exclusión de registros inválidos.`, consid: `<br>•Generar 1 orden de pago por RFC. <br>•Considerar tipos de agrupamiento.`, res: `Base consolidada por cliente y periodo` },
        { step: `Flujo A - 4`, title: `Cálculo de pagos`, actor: `Administración`, desc: `<br>•Calcular monto por cliente: Monto = (Kilos MUTA − Kilos donados) × Precio ± Penalizaciones. <br>•Validar consistencia de kilos y precio. Usar OCR / IA.`, consid: `Kilos donados (programa árboles) y penalizaciones calculadas separadamente.`, res: `Monto total a pagar por cliente` },
        { step: `Flujo A - 5`, title: `Generación de Orden de Pago`, actor: `Administración`, desc: `Generar documento estándar que incluye: RFC, desglose por sucursal, periodo, kilos, monto total, referencias. Enviar orden y solicitar factura.`, consid: `-`, res: `Orden de pago enviada` },
        { step: `Flujo A - 6`, title: `Facturación (Cliente)`, actor: `Cliente`, desc: `Recibir orden de pago, emitir factura y enviar a Sonne.`, consid: `•Ciclo de cortes: 1er corte (día 15), 2do corte (fin de mes). <br>•Facturas no enviadas se acumulan.`, res: `Factura emitida y enviada` },
        { step: `Flujo A - 7`, title: `Recepción y validación de factura`, actor: `Administración`, desc: `Recepción de factura. Validación de: RFC correcto, monto coincidente, datos fiscales completos.`, consid: `Regla crítica: <br>•Sin factura NO se procesa el pago. <br>•Factura incorrecta = rechazo.`, res: `Factura validada y autorizada` },
        { step: `Flujo A - 8`, title: `Aprobación financiera`, actor: `Administración / Tesorería / GG`, desc: `•Nivel 1: Administración (Cálculo, orden, factura). <br>•Nivel 2: Tesorería (Disponibilidad de fondos). <br>•Nivel 3: GG (Excepciones).`, consid: `•Rechazado -> Corrección / Aplazamiento. <br>•Aprobado -> ejecución.`, res: `Pago autorizado` },
        { step: `Flujo A - 9`, title: `Ejecución del pago`, actor: `Tesorería`, desc: `•Realizar transferencia (SPEI/bancaria). <br>•Registrar: referencia, fecha, monto.`, consid: `Pagos por corte y pagos especiales.`, res: `Pago ejecutado` },
        { step: `Flujo A - 10`, title: `Notificación al cliente`, actor: `Administración`, desc: `Enviar confirmación de pago: Comprobante y detalle.`, consid: `-`, res: `Cliente notificado` },
        { step: `Flujo A - 11`, title: `Registro y conciliación`, actor: `Administración / Finanzas`, desc: `•Registro contable. <br>• Conciliación bancaria. <br>•Cierre del periodo. <br>•Pagos acumulados. <br>•Pagos por corte. <br>•Pagos especiales`, consid: `-`, res: `Proceso cerrado y conciliado` },
        
        { step: `Flujo B - 1`, title: `Identificación de la necesidad`, actor: `Gerencia Comercial`, desc: `•Analizar volumen comprometido vs inventario. <br>•Detectar déficit. <br>•Revisar precio mercado y evaluar proveedor.`, consid: `-`, res: `Decisión de compra tomada` },
        { step: `Flujo B - 2`, title: `Negociación y acuerdo`, actor: `Gerencia Comercial`, desc: `•Contactar proveedor. <br>•Negociar precio, volumen, tipo de material, y condición de pago (efectivo, SPEI, anticipo). <br>•Definir lugar/fecha. <br>•Registrar acuerdo.`, consid: `Alta variabilidad y posible falta de formalidad.`, res: `Acuerdo documentado` },
        { step: `Flujo B - 3`, title: `Recepción y verificación`, actor: `Operaciones / Planta`, desc: `•Recibir unidad. <br>•Pesaje en báscula Sonne (dato oficial). <br>•Análisis de calidad (Acidez, Humedad, Impurezas). <br>•Comparar kilos acordados vs recibidos.`, consid: `•El dato de Sonne es oficial. <br>•Registrar cualquier desviación.`, res: `Kilos aceptados y validados` },
        { step: `Flujo B - 4`, title: `Cálculo del monto`, actor: `Administración / Comercial`, desc: `•Kilos aceptados × Precio. <br>•Aplicar ajustes por calidad/volumen. <br>•Validar anticipos.`, consid: `Evitar cálculos manuales sin respaldo. Todo documentado.`, res: `Monto validado` },
        { step: `Flujo B - 5`, title: `Facturación / documentación`, actor: `Proveedor / Administración`, desc: `Si hay factura: <br>•Validar RFC y monto. Si NO hay: <br>•Registrar flag 'sin factura', generar nota, foto báscula, comprobante y justificar excepción.`, consid: `Riesgo fiscal directo. Requiere trazabilidad total.`, res: `Factura o documentación válida` },
        { step: `Flujo B - 6`, title: `Aprobación financiera`, actor: `Admin / Tesorería / GG`, desc: `•N1: Admin (monto, kilos, evidencias). <br>•N2: Tesorería (fondos). <br>•N3: GG (pago en efectivo, sin factura, excepciones).`, consid: `-`, res: `Pago autorizado` },
        { step: `Flujo B - 7`, title: `Ejecución del pago`, actor: `Tesorería`, desc: `•Definir forma (SPEI / Efectivo como excepción). <br>•Ejecutar y registrar referencia.`, consid: `-`, res: `Pago ejecutado` },
        { step: `Flujo B - 8`, title: `Registro y conciliación`, actor: `Finanzas / Contabilidad`, desc: `•Registrar costo materia prima. <br>•Clasificar deducible/no deducible. <br>•Marcar riesgo fiscal. <br>•Conciliar banco.`, consid: `-`, res: `Pago registrado y conciliado` },
        
        { step: `Flujo C - 1`, title: `Validación de condiciones de pago`, actor: `Administración`, desc: `•Revisar Orden de Compra y condiciones de pago. <br>•Validar que la recepción esté registrada en sistema.`, consid: `Sin recepción validada, no se continúa.`, res: `Condiciones de pago confirmadas` },
        { step: `Flujo C - 2`, title: `Recepción y validación de factura (3-WAY MATCH)`, actor: `Administración / Sistema`, desc: `Validar factura contra OC y Recepción (proveedor, monto, concepto, datos fiscales).`, consid: `3-way match obligatorio. Si no coincide, rechazo.`, res: `Factura validada` },
        { step: `Flujo C - 3`, title: `Programación del pago`, actor: `Administración / Tesorería`, desc: `Definir fecha de pago según vencimiento y flujo de caja.`, consid: `Si hay falta de liquidez, negociar extensión.`, res: `Pago programado` },
        { step: `Flujo C - 4`, title: `Aprobación financiera`, actor: `Admin / Tesorería / GG`, desc: `•N1: Admin valida OC, factura, cálculo. <br>•N2: Tesorería valida fondos. <br>•N3: GG aprueba excepciones.`, consid: `Si error, regresa a validación. Si falta fondos, aplaza.`, res: `Pago autorizado` },
        { step: `Flujo C - 5`, title: `Ejecución del pago`, actor: `Tesorería`, desc: `•Transferencia SPEI. <br>•Registrar referencia, fecha, monto. <br>•Notificar proveedor.`, consid: `-`, res: `Pago ejecutado` },
        { step: `Flujo C - 6`, title: `Registro y conciliación`, actor: `Finanzas / Contabilidad`, desc: `•Registrar en centro de costo y partida contable. <br>•Conciliar banco. <br>•Cerrar OC.`, consid: `-`, res: `Pago registrado y conciliado` }
    ],
    subprocesos: [
        { title: `Gestión de Penalizaciones`, desc: `Se gestiona fuera del flujo principal, no bloquea pagos. Penalizaciones a clientes (mezcla indebida, retrasos, visitas cero) generan reducción del monto. Penalizaciones a proveedores (errores, retrasos) generan ajustes internos o económicos.` },
        { title: `Soporte TI`, desc: `Soporte a incidencias operativas en MUTA, calidad de datos (corrección de direcciones, ajusten en duplicados) y soporte evolutivo (mejoras al sistema).` },
        { title: `Pago a ONG (Programa Arbolitos)`, desc: `Gestionar el pago correspondiente a los kilos donados a ONG. Separado del pago al generador. Cálculo sobre kilos donados. Registro como gasto separado.` }
    ],
    reglas: [
        `<b>Flujo A</b> - Validación: Todo registro debe contener RFC, kilos, precio y estado válido. MUTA es la única fuente de datos operativos.`,
        `<b>Flujo A</b> - Cálculo: Se calcula como Kilos Netos (ajustado para donaciones) × Precio.`,
        `<b>Flujo A</b> - Financieras: Pagos < $500 se acumulan. Se ejecutan en periodos definidos (2 cortes al mes).`,
        `<b>Flujo A</b> - Facturación: No se puede ejecutar un pago sin factura válida que coincida con la Orden de Pago.`,
        `<b>Flujo B</b> - Recepción: Peso registrado en báscula Sonne es oficial. Sin validación de calidad, no se continúa. Material rechazado no genera pago.`,
        `<b>Flujo B</b> - Facturación: Pagos sin factura son excepcionales y requieren flag 'sin factura', justificación, fotos y autorización de GG.`,
        `<b>Flujo C</b> - Origen: Todo pago debe estar respaldado por una OC aprobada y una recepción validada.`,
        `<b>Flujo C</b> - Validación: 3-WAY MATCH obligatorio (OC + Recepción + Factura coinciden).`,
        `<b>Flujo C</b> - Ejecución: Pagos vía transferencia (SPEI) y aprobados según matriz (N1, N2, N3).`
    ],
    kpis: [
        { cat: `Flujo A`, nombre: `Tiempo total de ciclo de pago`, formula: `Fecha pago – Fecha extracción`, interpretacion: `Menor tiempo = mayor eficiencia` },
        { cat: `Flujo A`, nombre: `% de pagos con errores`, formula: `(Pagos con error / Total) × 100`, interpretacion: `Ideal <5%` },
        { cat: `Flujo A`, nombre: `Costo por kilo`, formula: `Total pagado / Total kilos`, interpretacion: `Base para margen` },
        { cat: `Flujo A`, nombre: `% pagos sin factura`, formula: `(Pagos sin factura / Total) × 100`, interpretacion: `Debe ser 0% esperado` },
        { cat: `Flujo B`, nombre: `% compras con factura`, formula: `(Con factura / Total) × 100`, interpretacion: `Bajo = riesgo fiscal` },
        { cat: `Flujo B`, nombre: `% rechazos de material`, formula: `(Rechazadas / Total) × 100`, interpretacion: `Alto = mala calidad proveedor (<10%)` },
        { cat: `Flujo C`, nombre: `Tiempo factura → pago`, formula: `Fecha pago − fecha factura`, interpretacion: `Dentro del plazo acordado` },
        { cat: `Flujo C`, nombre: `% pagos con 3-way match`, formula: `(Pagos validados / total) × 100`, interpretacion: `Control clave, debe ser 100%` }
    ],
    roles: [
        { rol: `Logística y Recolección (A)`, resp: `Validar información en campo`, act: `Registrar en MUTA, capturar kilos, evidencias`, etapa: `Flujo A: 0` },
        { rol: `Administración (A, B, C)`, resp: `Control y cálculo`, act: `Validar datos, calcular monto, generar OC/pagos, 3-way match`, etapa: `Todas las fases administrativas` },
        { rol: `Cliente / Proveedor`, resp: `Facturación y entrega`, act: `Emitir factura, entregar material, proveer evidencia`, etapa: `Fases de facturación y entrega` },
        { rol: `Gerencia Comercial (B)`, resp: `Negociar compras`, act: `Detectar necesidad, negociar precio, registrar acuerdo`, etapa: `Flujo B: 1, 2` },
        { rol: `Operaciones / Planta (B)`, resp: `Recepción y calidad`, act: `Recibir material, pesar, analizar calidad`, etapa: `Flujo B: 3` },
        { rol: `Tesorería (A, B, C)`, resp: `Ejecutar pago`, act: `Validar fondos, ejecutar transferencia`, etapa: `Fases de ejecución` },
        { rol: `Finanzas (A, B, C)`, resp: `Registro y conciliación`, act: `Registrar contablemente, conciliar bancos`, etapa: `Fases finales` },
        { rol: `Gerencia General`, resp: `Aprobar excepciones`, act: `Aprobar pagos sin factura, en efectivo o urgencias`, etapa: `Aprobación Nivel 3` }
    ],
    riesgos: [
        { riesgo: `Pago incorrecto`, causa: `Error en cálculo`, impacto: `Alto`, prob: `Media`, sev: `Alta`, control: `Validación de cálculo / Aprobación N1`, tipo: `Preventivo`, etapa: `Cálculo`, resp: `Administración` },
        { riesgo: `Pago sin factura`, causa: `Omisión validación`, impacto: `Alto`, prob: `Baja`, sev: `Alta`, control: `Bloqueo por sistema sin factura`, tipo: `Preventivo`, etapa: `Factura`, resp: `Administración` },
        { riesgo: `Duplicidad de pago`, causa: `Falta control de duplicados`, impacto: `Alto`, prob: `Media`, sev: `Alta`, control: `Validación duplicidad (ID + fecha)`, tipo: `Preventivo`, etapa: `Validación`, resp: `Administración` },
        { riesgo: `Error en kilos netos`, causa: `Uso incorrecto de kilos`, impacto: `Alto`, prob: `Media`, sev: `Alta`, control: `Validación cruzada MUTA vs interno`, tipo: `Detectivo`, etapa: `Cálculo`, resp: `Administración` },
        { riesgo: `Transferencia errónea`, causa: `Datos bancarios incorrectos`, impacto: `Alto`, prob: `Baja`, sev: `Alta`, control: `Validación previa de cuenta`, tipo: `Detectivo`, etapa: `Ejecución`, resp: `Tesorería` }
    ],
    formatos: [
        { title: `Formato de Orden de Pago`, objetivo: `Formalizar el monto a pagar al cliente y solicitar factura`, campos: `ID / Folio, Cliente (RFC), Periodo, Total de kilos netos, Precio por kilo, Monto total, Referencia, Fecha, Estatus`, uso: `Etapa 5 – Generación de orden de pago` },
        { title: `Formato de Validación de Factura`, objetivo: `Asegurar que la factura sea correcta antes del pago`, campos: `Folio de orden, RFC cliente, Monto factura, Coincidencia (Sí/No), Validación fiscal, Observaciones, Estatus`, uso: `Etapa 7 – Validación de factura` },
        { title: `Formato de Penalizaciones`, objetivo: `Gestionar ajustes fuera del flujo principal`, campos: `ID penalización, Tipo, Motivo, Cliente, Monto, Evidencia, Estatus, Aplicación`, uso: `Subproceso de penalizaciones` }
    ],
    diagrama: {
        url: `https://www.figma.com/board/LcHyLrp5TAAwHA8NlENxst/Procesos-Bloque-1--Compras--Almacen--Mantenimiento-?node-id=409-124`,
        img: `img/Proceso Pagos.jpg`, 
        text: `Ver diagrama completo de Pagos`
    }
},
    compras: {
    contexto: {
        icon: `🛒`,
        title: `Gestión de Compras`,
        objetivo: `Garantizar la adquisición oportuna, eficiente y controlada de bienes y servicios, optimizando el uso del presupuesto, asegurando transparencia en la selección de proveedores y cumpliendo con las políticas internas mediante un esquema de control basado en niveles de compra, validaciones financieras y segregación de funciones. `,
        alcance: `El proceso abarca todas las actividades desde la detección de la necesidad hasta el pago al proveedor y evaluación posterior, incluyendo: 

<br>•Creación de Solicitud de Compra (SC)  

<br>•Clasificación de compra por nivel (monto y urgencia)  

<br>•Validación presupuestal (Finanzas)  

<br>•Flujo de aprobaciones según nivel  

<br>•Gestión de cotizaciones (RFQ) y selección de proveedor  

<br>•Generación de Orden de Compra (OC)  

<br>•Recepción de bienes o servicios  

<br>•Validación documental (3-way match)  

<br>•Ejecución de pagos (Tesorería)  

<br>•Evaluación de proveedores y seguimiento de KPIs  

<br>Adicionalmente, incluye un subproceso especial para compras de emergencia operativa (Nivel 3A), permitiendo la ejecución inmediata con regularización obligatoria en sistema en un plazo máximo de 24 horas. `
    },
    proceso: [
        { step: `1`, title: `Detección de necesidad`, actor: `Solicitante / Sistema`, desc: `•Origen: requerimiento operativo, stock mínimo, mantenimiento programado. <br>•El sistema puede sugerir proveedores frecuentes, precios históricos y tiempos de entrega.`, consid: `-`, res: `Requerimiento identificado y listo para formalización` },
        { step: `2`, title: `Creación de Solicitud de Compra (SC)`, actor: `Solicitante`, desc: `Captura en sistema con campos obligatorios: <br>•Tipo de compra (Operativa, Mantenimiento, Urgente/Fast-Track) <br>•Nivel de compra (1,2,3,3A,4) <br>•Centro de costo <br>•Cantidad <br>•Fecha requerida <br>•Justificación. <br>Validaciones automáticas de catálogos.`, consid: `Validación de campos obligatorios.`, res: `Solicitud de Compra registrada (Pendiente validación)` },
        { step: `3`, title: `Validación Presupuestal`, actor: `Finanzas`, desc: `<br>•Validación de disponibilidad, partida contable y centro de costo. <br>•Control por nivel de compra. <br>Escenarios: <br>• Aprobado <br>• Rechazado <br>• Ajuste (modificación de monto).`, consid: `Asigna presupuesto si es aprobado.`, res: `SC aprobada con presupuesto asignado` },
        { step: `4`, title: `Flujo de Aprobación`, actor: `Sistema + Aprobador`, desc: `•Flujo automático basado en monto, tipo y área. <br>•Niveles: N1 (Jefe Directo) <br>•N2 (Gerencia) <br>•N3 (Dirección) <br>•N3A (Gerente Ops rápido) <br>•N4 (Dirección+Consejo).`, consid: `Notificaciones automáticas.`, res: `SC aprobada / rechazada` },
        { step: `5`, title: `Proceso de Cotización`, actor: `Compras`, desc: `•Envío de solicitudes (RFQ) a proveedores. <br>•Recepción y comparación automática: Precio, entrega, condiciones, score histórico.`, consid: `Regla: Mínimo 2 cotizaciones.`, res: `Cuadro comparativo de cotizaciones` },
        { step: `6`, title: `Selección de Proveedor`, actor: `Compras`, desc: `•Análisis de propuestas y selección del óptimo (costo-beneficio). <br>•Validar al proveedor (calidad, precio, etc.).`, consid: `Regla clave: Si no se selecciona la mejor opción, justificar en sistema.`, res: `Proveedor seleccionado` },
        { step: `7`, title: `Generación de Orden de Compra (OC)`, actor: `Sistema + Compras`, desc: `•Generación automática de OC basada en SC. <br>•Inclusión de datos, condiciones, fecha. <br>•Envío automático.`, consid: `Si es emergencia: Puede NO existir OC previa, pero debe generarse después.`, res: `OC emitida y enviada` },
        { step: `8`, title: `Recepción de Bienes/Servicios`, actor: `Almacén / Operaciones`, desc: `•Recepción física o validación. <br>•Comparación cantidad/calidad vs OC. <br>•Registro de evidencia (fotos, firma).`, consid: `Manejo de incidencias: Rechazo parcial o total.`, res: `Recepción registrada (Aceptada/Rechazada)` },
        { step: `9`, title: `Validación de Factura`, actor: `Sistema + Compras`, desc: `Validación automática: OC + Recepción + Factura.`, consid: `Coincide -> pasa a pago. No coincide -> bloqueo e incidencia.`, res: `Factura validada` },
        { step: `10`, title: `Ejecución de Pago`, actor: `Tesorería`, desc: `•Programación según condiciones y flujo de caja. <br>•Ejecución, registro y notificación.`, consid: `No se paga si el proveedor no está registrado o la OC no está regularizada.`, res: `Pago realizado` }
    ],
    subprocesos: [
        { title: `Proceso Fast-Track Emergencia (Nivel 3A)`, desc: `1. Operador detecta falla crítica.
2. Autorización rápida (Llamada/WhatsApp) por Gerente Ops.
3. Compra directa.
4. Regularización obligatoria en sistema (SC + OC) en máximo 24 horas.
5. Evidencia obligatoria (factura, fotos, ticket).
6. Auditoría semanal revisa KPIs de emergencias. (NO es para saltarse el proceso, solo urgencias reales).` }
    ],
    reglas: [
        `<b>General:</b> No existe OC sin SC aprobada. No hay aprobación sin validación presupuestal.`,
        `<b>General:</b> Mínimo 2 cotizaciones. Justificación obligatoria en decisiones si no es la mejor opción.`,
        `<b>General:</b> No se ejecuta pago sin OC válida, recepción validada y factura correcta.`,
        `<b>General:</b> Separación de funciones estricta: Finanzas ≠ Compras ≠ Tesorería.`,
        `<b>Creación:</b> Clasificación automática por monto y urgencia.`,
        `<b>Presupuesto:</b> Bloqueo si excede presupuesto. Toda SC debe tener partida asignada.`,
        `<b>Emergencia (N3A):</b> Compra inmediata permitida, pero registro obligatorio (SC+OC) en máx 24h con evidencia.`,
        `<b>Control:</b> Si > $20,000 y urgente, requiere aprobación adicional. Si >3 urgencias en 30 días, análisis preventivo. Proveedor nuevo requiere alta express.`
    ],
    kpis: [
        { cat: `Eficiencia`, nombre: `Tiempo total de compra`, formula: `Fecha pago – Fecha solicitud`, interpretacion: `Menor tiempo = mayor eficiencia` },
        { cat: `Eficiencia`, nombre: `Tiempo de aprobación`, formula: `Fecha aprobación – Fecha solicitud`, interpretacion: `Alto = cuellos de botella` },
        { cat: `Eficiencia`, nombre: `Tiempo generación OC`, formula: `Fecha OC – Fecha aprobación`, interpretacion: `Mide eficiencia de Compras` },
        { cat: `Eficiencia`, nombre: `Tiempo de pago`, formula: `Fecha pago – Fecha factura validada`, interpretacion: `Impacta relación con proveedor` },
        { cat: `Control Financiero`, nombre: `% compras dentro de presupuesto`, formula: `(Compras dentro / total) × 100`, interpretacion: `Alto = buen control financiero` },
        { cat: `Control Financiero`, nombre: `% desviación presupuestal`, formula: `(Gasto real – pres) / pres × 100`, interpretacion: `Alto = sobrecostos` },
        { cat: `Control Financiero`, nombre: `Ahorro en compras`, formula: `(Precio estimado – real) / estimado × 100`, interpretacion: `Alto = buena negociación` },
        { cat: `Gestión Compras`, nombre: `% compras con excepción`, formula: `(Compras excepción / total) × 100`, interpretacion: `Alto = riesgo de malas decisiones` },
        { cat: `Gestión Compras`, nombre: `% compras con RFQ`, formula: `(Compras con RFQ / total) × 100`, interpretacion: `Alto = mayor control` },
        { cat: `Operación`, nombre: `% entregas a tiempo`, formula: `(Entregas a tiempo / total) × 100`, interpretacion: `Bajo = proveedor deficiente` },
        { cat: `Operación`, nombre: `% entregas sin error`, formula: `(Entregas correctas / total) × 100`, interpretacion: `Bajo = problemas operativos` },
        { cat: `Control`, nombre: `% compras urgentes`, formula: `(Compras urgentes / total) × 100`, interpretacion: `Alto = mala planeación` }
    ],
    roles: [
        { rol: `Solicitante`, resp: `Registrar necesidades`, act: `Detectar necesidad, crear SC, indicar urgencia`, etapa: `1. Detección, 2. Creación` },
        { rol: `Sistema / Workflow`, resp: `Automatizar y validar`, act: `Clasificar nivel, flujo aprobación, RFQ automático, OC automática, 3-way match`, etapa: `Todas (transversal)` },
        { rol: `Finanzas`, resp: `Control presupuestal`, act: `Validar fondos, asignar partida, autorizar/rechazar, monitorear consumo`, etapa: `3. Presupuesto` },
        { rol: `Aprobador`, resp: `Autorizar solicitudes`, act: `Revisar SC, aprobar/rechazar según nivel jerárquico`, etapa: `4. Aprobación` },
        { rol: `Compras / Procurement`, resp: `Administrar gasto`, act: `Gestionar RFQs, seleccionar proveedor (justificar), generar OC, regularizar urgencias (≤ 24h)`, etapa: `5, 6, 7` },
        { rol: `Proveedor`, resp: `Suministro`, act: `Enviar cotización, entregar bienes, enviar factura`, etapa: `Cotización, Entrega, Facturación` },
        { rol: `Almacén / Operaciones`, resp: `Validar recepción`, act: `Recibir productos, validar vs OC, registrar evidencia e incidencias`, etapa: `8. Recepción` },
        { rol: `Tesorería`, resp: `Ejecutar pagos`, act: `Programar pagos, ejecutar SPEI, validar 3-way match`, etapa: `10. Ejecución` },
        { rol: `Auditoría / Control`, resp: `Supervisar cumplimiento`, act: `Validar trazabilidad, auditar políticas, revisar excepciones e incidencias`, etapa: `Transversal` }
    ],
    riesgos: [
        { riesgo: `Compra sin necesidad real`, causa: `Falta de validación`, impacto: `Medio`, prob: `Media`, sev: `Media`, control: `Justificación obligatoria + aprobación`, tipo: `Preventivo`, etapa: `Aprobación`, resp: `Aprobador` },
        { riesgo: `Compra sin presupuesto`, causa: `No validación`, impacto: `Alto`, prob: `Baja`, sev: `Alta`, control: `Control en tiempo real + alertas`, tipo: `Preventivo`, etapa: `SC`, resp: `Finanzas` },
        { riesgo: `Fraude`, causa: `Mismo usuario controla todo`, impacto: `Crítico`, prob: `Baja`, sev: `Crítica`, control: `Separación: Finanzas ≠ Compras ≠ Tesorería`, tipo: `Preventivo`, etapa: `General`, resp: `Sistema` },
        { riesgo: `Selección proveedor inadecuado`, causa: `Falta comparativa`, impacto: `Alto`, prob: `Media`, sev: `Alta`, control: `Mínimo 2 cotizaciones + Justificación`, tipo: `Preventivo`, etapa: `Cotización`, resp: `Compras` },
        { riesgo: `Recepción incorrecta`, causa: `No validación vs OC`, impacto: `Alto`, prob: `Media`, sev: `Alta`, control: `Validación física vs OC + evidencia`, tipo: `Preventivo`, etapa: `Recepción`, resp: `Almacén` },
        { riesgo: `Pago sin validación`, causa: `Falta control documental`, impacto: `Alto`, prob: `Baja`, sev: `Crítica`, control: `Validación 3-way match`, tipo: `Preventivo`, etapa: `Pago`, resp: `Sistema / Tesorería` },
        { riesgo: `Exceso de compras urgentes`, causa: `Mala planeación`, impacto: `Alto`, prob: `Alta`, sev: `Media`, control: `Alertas de compras urgentes + Análisis`, tipo: `Detectivo`, etapa: `General`, resp: `Sistema` }
    ],
    formatos: [
        { title: `Formato: Solicitud de Compra`, objetivo: `Formalizar la necesidad`, campos: `ID, Fecha, Solicitante, Centro costo, Tipo compra, Descripción, Cantidad, Justificación, Presupuesto estimado`, uso: `Etapa 2` },
        { title: `Formato: Control Presupuestal`, objetivo: `Validar disponibilidad`, campos: `Área, Centro costo, Presupuesto asignado, Gasto acumulado, Disponible, Solicitado, Estatus, Justificación`, uso: `Etapa 3` },
        { title: `Formato: Acta de Selección de Proveedor`, objetivo: `Justificar decisión`, campos: `Proveedor seleccionado, Motivo, Comparativa, ¿Mejor opción?, Justificación, Aprobación`, uso: `Etapa 6` },
        { title: `Formato: Orden de Compra`, objetivo: `Formalizar compra`, campos: `ID OC, Proveedor, Descripción, Cantidad, Precio, Total, Condiciones, Fecha entrega`, uso: `Etapa 7` }
    ],
    diagrama: {
        url: `https://www.figma.com/board/LcHyLrp5TAAwHA8NlENxst/Procesos-Bloque-1--Compras--Almacen--Mantenimiento-?node-id=431-2488`,
        img: `img/Proceso Compras.jpg`,
        text: `Ver diagrama completo de Compras`
    }
},
    almacen: {
    contexto: {
        icon: `📦`,
        title: `Gestión de Almacén`,
        objetivo: `Asegurar la disponibilidad oportuna de refacciones e insumos mediante una gestión eficiente, controlada y trazable del inventario, garantizando el registro en tiempo real de todos los movimientos, la correcta planeación de niveles de stock y la formalización de las necesidades de abastecimiento a través de requisiciones hacia el proceso de Compras. `,
        alcance: `El proceso abarca desde la planeación de inventarios hasta la mejora continua, incluyendo la organización del almacén, recepción de materiales, control de inventario, gestión de salidas y control operativo. Asimismo, contempla la detección de necesidades de abastecimiento, la gestión multi-base y la generación de requisiciones que activan el proceso de Compras, asegurando alineación entre el inventario físico y el sistema. `
    },
    proceso: [
        { step: `1`, title: `Planeación de Inventarios`, actor: `Planeación / Operaciones`, desc: `•Integración de la demanda (Mantenimiento, Operaciones, Logística). <br>•Análisis de consumo histórico. <br>•Clasificación de productos (Críticos vs Bajo demanda). <br>•Definición de Stock Mínimo, Máximo <br>•Punto de Reorden.`, consid: `Evaluación de variables: precio, rotación, disponibilidad, espacio.`, res: `Plan de abastecimiento y niveles definidos` },
        { step: `2`, title: `Organización del Almacén`, actor: `Almacén`, desc: `•Definir estructura física (Zonas, racks, niveles, posiciones). <br>•Asignar ubicación fija a cada SKU. <br>•Normalizar catálogo. <br>•Implementar identificación visual (etiquetas, códigos). <br>•Replicar modelo en todas las bases (central y regionales).`, consid: `-`, res: `Almacén estructurado y catálogo estandarizado` },
        { step: `3`, title: `Recepción de Materiales`, actor: `Almacén`, desc: `•Recibir contra Orden de Compra. <br>•Validar cantidad/calidad. <br>•Si no cumple: Rechazo + devolución. <br>•Si cumple parcial: registro parcial y notificar a Compras. <br>•Registrar entrada en sistema en tiempo real antes de ubicar. <br>•Asignar ubicación física.`, consid: `Regla crítica: Sin OC válida: NO se recibe.`, res: `Inventario actualizado y entrada con folio ligado a OC` },
        { step: `4`, title: `Control de Inventario`, actor: `Almacén / Auditoría`, desc: `•Monitoreo continuo vs niveles definidos. <br>•Reabastecimiento: Al bajar del punto de reorden se genera requisición en sistema. <br>•Insumos de planta: <br>•Ops reporta consumo <br>•Almacén genera requisición. <br>•Conteos cíclicos y consideraciones multi-base (transferencias).`, consid: `Requisición se convierte en entrada formal de Compras.`, res: `Requisiciones de compra e inventario confiable` },
        { step: `5`, title: `Control de Salidas`, actor: `Almacén / Ops / Dirección`, desc: `•Clasificación de salidas (Con autorización, Sin autorización, Contra cambio). <br>•Validar disponibilidad. <br>•Si no hay stock: notificar y reabastecer. <br>•Registro en sistema antes de entrega. <br>•Actualizar inventario en tiempo real.`, consid: `Salida contra cambio exige devolución de material.`, res: `Inventario actualizado y salida registrada` },
        { step: `6`, title: `Control y Orden del Almacén`, actor: `Auditoría / Supervisión`, desc: `•Validación sistema vs inventario físico. Orden y limpieza visual (5S). <br>•Auditorías programadas mínimo 1 por mes.`, consid: `-`, res: `Almacén organizado e inventario alineado` },
        { step: `7`, title: `Evaluación y Auditoría`, actor: `Auditoría / Supervisión`, desc: `•Realizar auditorías periódicas, medir KPIs <br>•Analizar desviaciones <br>•Evaluar proveedores con incidencias.`, consid: `-`, res: `Reportes de auditoría e indicadores de desempeño` },
        { step: `8`, title: `Retroalimentación y Mejora Continua`, actor: `Dirección / Administración`, desc: `•Revisión periódica de KPIs <br>•Sesiones de retroalimentación <br>•Definir acciones correctivas y dar seguimiento.`, consid: `-`, res: `Plan de mejora y acciones implementadas` }
    ],
    subprocesos: [],
    reglas: [
        `<b>Generales:</b> Todo producto debe tener SKU y ubicación. Movimientos deben registrarse en tiempo real. No hay movimiento sin registro. Sistema y físico deben estar alineados.`,
        `<b>Planeación:</b> Niveles basados en consumo. Clasificación en críticos / baja demanda.`,
        `<b>Organización:</b> Ubicaciones estandarizadas (zona, rack, nivel). Modelo replicado multi-base.`,
        `<b>Recepción:</b> Material sin OC no se recibe. Devoluciones requieren incidencia y validación técnica.`,
        `<b>Inventario:</b> Almacén genera requisiciones de compra, no compra directo. Ajustes prohibidos sin causa raíz.`,
        `<b>Insumos de planta:</b> Operaciones reporta consumo, Almacén gestiona la requisición.`,
        `<b>Salidas:</b> No hay entrega sin folio registrado. Salida contra cambio exige devolución.`,
        `<b>Multi-base:</b> Transferencias deben registrar salida origen y entrada destino.`
    ],
    kpis: [
        { cat: `Inventario`, nombre: `Exactitud de inventario (%)`, formula: `(Productos correctos / Total revisados) × 100`, interpretacion: `Confiabilidad general. Meta ≥ 98%` },
        { cat: `Trazabilidad`, nombre: `Nivel de trazabilidad (%)`, formula: `(Movimientos registrados / Movimientos totales) × 100`, interpretacion: `Debe ser 100%` },
        { cat: `Operación`, nombre: `% salidas registradas en tiempo real`, formula: `(Registradas antes de entrega / Total) × 100`, interpretacion: `Garantiza control. Meta 100%` },
        { cat: `Operación`, nombre: `Nivel de cumplimiento de pedidos (%)`, formula: `(Pedidos completos a tiempo / Total) × 100`, interpretacion: `Mide nivel de servicio > 90%` },
        { cat: `Operación`, nombre: `Tiempo de recepción`, formula: `Hora registro – Hora llegada`, interpretacion: `Ideal < 2 horas` },
        { cat: `Calidad`, nombre: `% recepciones con incidencias`, formula: `(Recepciones con error / Total) × 100`, interpretacion: `< 5% esperado` },
        { cat: `Control`, nombre: `Diferencias físico vs sistema`, formula: `Σ diferencias detectadas`, interpretacion: `Debe tender a 0` },
        { cat: `Control`, nombre: `% ajustes con causa raíz`, formula: `(Ajustes con causa / Total) × 100`, interpretacion: `Debe ser 100%` },
        { cat: `Servicio`, nombre: `Tasa de quiebre de stock`, formula: `(Solicitudes no atendidas / Total) × 100`, interpretacion: `< 5%. Si sube, falla planeación` }
    ],
    roles: [
        { rol: `Almacén`, resp: `Responsable operativo`, act: `Recibir, validar, registrar E/S, conteos cíclicos, requisiciones, control multi-base`, etapa: `2, 3, 4, 5, 6` },
        { rol: `Planeación / Operaciones`, resp: `Definir demanda`, act: `Integrar necesidades, analizar consumos, definir niveles, clasificar productos`, etapa: `1, 4, 8` },
        { rol: `Compras`, resp: `Abastecimiento`, act: `Procesar requisiciones, generar OC, seguimiento proveedores`, etapa: `4 (Recepción de Req), 3` },
        { rol: `Mantenimiento / Operaciones`, resp: `Usuarios`, act: `Reportar consumos, solicitar salidas, validar técnica`, etapa: `1, 3, 4, 5` },
        { rol: `Sistemas / TI`, resp: `Soporte tecnológico`, act: `Asegurar registro, configurar multi-base, habilitar alertas`, etapa: `Transversal` },
        { rol: `Auditoría / Supervisión`, resp: `Control`, act: `Auditorías físicas, validar físico vs sistema, revisar causas raíz`, etapa: `6, 7` },
        { rol: `Dirección`, resp: `Estratégico`, act: `Revisar KPIs, autorizar salidas, definir acciones, toma de decisiones`, etapa: `5, 7, 8` }
    ],
    riesgos: [
        { riesgo: `Planeación incorrecta`, causa: `Falta o exceso de stock`, impacto: `Alto`, prob: `Media`, sev: `Alto`, control: `Planeación basada en históricos`, tipo: `Preventivo`, etapa: `Planeación`, resp: `Planeación` },
        { riesgo: `SKU duplicados`, causa: `Errores en inventario`, impacto: `Alto`, prob: `Media`, sev: `Alto`, control: `Catálogo centralizado`, tipo: `Preventivo`, etapa: `Organización`, resp: `Sistemas/Almacén` },
        { riesgo: `Recepción sin OC`, causa: `Ingreso no controlado`, impacto: `Alto`, prob: `Baja`, sev: `Alto`, control: `Bloqueo de recepción sin OC`, tipo: `Preventivo`, etapa: `Recepción`, resp: `Almacén` },
        { riesgo: `Desfase sistema vs físico`, causa: `Registro tardío`, impacto: `Alto`, prob: `Alta`, sev: `Alto`, control: `Registro en tiempo real`, tipo: `Preventivo`, etapa: `Recepción/Salidas`, resp: `Almacén` },
        { riesgo: `Entrega sin registro`, causa: `Pérdidas y descontrol`, impacto: `Alto`, prob: `Media`, sev: `Alto`, control: `Bloqueo de salida sin registro`, tipo: `Preventivo`, etapa: `Salidas`, resp: `Almacén` },
        { riesgo: `Falta de trazabilidad`, causa: `Procesos manuales`, impacto: `Crítico`, prob: `Alta`, sev: `Crítico`, control: `Trazabilidad 100% obligatoria`, tipo: `Preventivo`, etapa: `General`, resp: `Sistemas` }
    ],
    formatos: [
        { title: `Formato de Requisición de Compra`, objetivo: `Formalizar necesidad hacia Compras`, campos: `ID, Fecha, Solicitante, Producto, Cantidad, Justificación, Inventario actual, Prioridad`, uso: `Etapa 4` },
        { title: `Formato de Recepción de Materiales`, objetivo: `Registrar y validar ingreso`, campos: `ID, Fecha, OC, Proveedor, Producto, Cantidad recibida/esperada, Validación, Evidencia`, uso: `Etapa 3` },
        { title: `Formato de Control de Inventario`, objetivo: `Validar exactitud físico vs sistema`, campos: `ID, Fecha, Ubicación, Producto, Cantidad sistema/física, Diferencia, Causa, Acción`, uso: `Etapa 4 y 6` }
    ],
    diagrama: {
        url: `https://www.figma.com/board/LcHyLrp5TAAwHA8NlENxst/Procesos-Bloque-1--Compras--Almacen--Mantenimiento-?node-id=431-2488`,
        img: `img/Proceso Almacen.jpg`,
        text: `Ver diagrama completo de Almacén`
    }
},
    mantenimiento: {
    contexto: {
        icon: `🔧`,
        title: `Gestión de Mantenimiento`,
        objetivo: `Gestionar de manera eficiente, controlada y trazable el mantenimiento de los activos de la operación, asegurando su disponibilidad, seguridad y correcto funcionamiento, mediante un modelo basado en revisión técnica, ejecución estructurada y mejora continua.`,
        alcance: `El proceso de gestión de mantenimiento aplica a la administración, control y ejecución de todos los servicios técnicos asociados a los activos de la operación, incluyendo: 

<br>Tipos de servicio: 

<br>•Mantenimiento preventivo  

<br>•Mantenimiento correctivo  

<br>•Revisión / validación técnica  

<br>Otros servicios técnicos (inspección, limpieza, calibración, mejora, etc.) 

<br>•Tipos de ejecución: 

<br>•Taller interno  

<br>•Taller externo (proveedores) 

<br>Activos considerados: 

<br>•Unidades de transporte  

<br>•Sistemas auxiliares  

<br>•Equipos de planta  

Instalaciones `
    },
    proceso: [
        { step: `1`, title: `Detección del evento`, actor: `Operador / Sistema / Técnico`, desc: `•Operador ejecuta checklist pre-operativo (fugas, frenos, llantas). <br>•Sistema genera alertas por km, horas o vencimiento. <br>•Técnico detecta en revisiones programadas.`, consid: `Si se detecta anomalía, pasa a revisión. Si no, continua operación.`, res: `Evento identificado` },
        { step: `2`, title: `Revisión / validación (Paso Central)`, actor: `Técnico / Encargado`, desc: `•Inspección física detallada evaluando seguridad, estado técnico y normativa. <br>•Pruebas funcionales. <br>•Consulta de historial. <br>•Diagnóstico técnico documentado en sistema y clasificación de gravedad.`, consid: `Paso obligatorio central del proceso.`, res: `Diagnóstico técnico` },
        { step: `3`, title: `Definición de tipo de acción`, actor: `Encargado / Técnico`, desc: `Analizar diagnóstico, determinar impacto operativo y definir prioridad (alta, media, baja) y acción (Preventivo, Correctivo, Revisión, u otro servicio).`, consid: `-`, res: `Tipo de acción definido` },
        { step: `4`, title: `Definición de tipo de taller`, actor: `Encargado / Técnico`, desc: `•Evaluar complejidad técnica, capacidad interna (herramientas, refacciones, personal), costo y tiempos. <br>•Comparar interno vs externo.`, consid: `-`, res: `Tipo de taller definido (Interno / Externo)` },
        { step: `5`, title: `Registro del evento`, actor: `Técnico / Auxiliar`, desc: `•Captura en sistema digital: Activo, tipo de evento, tipo de acción y taller, descripción, fecha/hora, usuario, km. <br>•Adjuntar evidencia obligatoria (fotos, videos).`, consid: `Evento sin registro NO existe. Evento sin evidencia NO avanza.`, res: `Evento registrado con folio y trazable` },
        { step: `6`, title: `Programación`, actor: `Encargado / Coordinador Ops`, desc: `Validar disponibilidad del activo, coordinar con operación (rutas), asignar fecha y responsable. Validar si preventivo está en ventana, o si correctivo es crítico.`, consid: `-`, res: `Orden programada` },
        { step: `7`, title: `Ejecución de mantenimiento`, actor: `Técnico / Proveedor / Encargado`, desc: `•Revisar orden y confirmar recursos. <br>•Registrar inicio. <br>•Preventivo: checklist, limpieza, ajuste, sustitución. <br>•Correctivo: desmontar, reparar, pruebas. <br>•Taller Externo: documentar salida/entrada, facturas y validar vs cotización.`, consid: `Nuevas fallas detectadas requieren nuevo evento. Proveedor externo exige cotización y autorización.`, res: `Servicio ejecutado y documentado` },
        { step: `8`, title: `Validación final`, actor: `Encargado de mantenimiento`, desc: `•Validar cumplimiento técnico, seguridad y funcionamiento. <br>•Revisar evidencia y realizar pruebas operativas.`, consid: `Regla crítica: No se puede cerrar sin validación final. Si falla, regresa a ejecución.`, res: `Validación aprobada` },
        { step: `9`, title: `Cierre`, actor: `Auxiliar / Encargado`, desc: `•Registrar tipo de servicio, costos, proveedor. <br>•Actualizar estatus del activo (Disponible/Con Restricción). <br>•Cerrar evento en el sistema.`, consid: `-`, res: `Evento cerrado` },
        { step: `10`, title: `Reporte y mejora continua`, actor: `Encargado / Dirección`, desc: `•Analizar desempeño (KPIs), identificar fallas recurrentes, evaluar proveedores, ajustar plan preventivo. <br>•Generar acciones correctivas.`, consid: `-`, res: `Mejora continua` }
    ],
    subprocesos: [],
    reglas: [
        `•Todo evento debe registrarse con evidencia en el sistema antes de ser atendido; sin registro no existe.`,
        `•Obligatoria la revisión/validación técnica antes de definir la acción.`,
        `<b>Seguridad:</b> Si el activo representa riesgo, pasa automáticamente a 'Fuera de servicio'.`,
        `•No se permite cerrar un evento sin validación técnica final y evidencia completa.`,
        `<b>Preventivo:</b> Debe ejecutarse dentro de sus ventanas de tolerancia.`,
        `</b>Taller Externo:</b> Requiere cotización previa, autorización y control documental completo a la entrada y salida.`,
        `•Durante la ejecución, nuevas fallas se registran como eventos independientes.`,
        `•Checklist pre-operativo es obligatorio antes de operar el activo.`
    ],
    kpis: [
        { cat: `Disponibilidad`, nombre: `Disponibilidad de activos (%)`, formula: `(Activos disponibles / Total activos) × 100`, interpretacion: `Qué tan lista está la operación para trabajar` },
        { cat: `Preventivo`, nombre: `% preventivo vs correctivo`, formula: `(Preventivos / Total eventos) × 100`, interpretacion: `Nivel de madurez del mantenimiento` },
        { cat: `Preventivo`, nombre: `Cumplimiento de preventivos (%)`, formula: `(Preventivos realizados / programados) × 100`, interpretacion: `Disciplina del proceso preventivo` },
        { cat: `Preventivo`, nombre: `Cumplimiento de ventanas (%)`, formula: `(Preventivos en ventana / total) × 100`, interpretacion: `Oportunidad del mantenimiento` },
        { cat: `Eficiencia`, nombre: `Tiempo de respuesta`, formula: `Hora inicio atención - hora registro`, interpretacion: `Rapidez ante fallas` },
        { cat: `Eficiencia`, nombre: `Tiempo de ejecución`, formula: `Hora cierre - hora inicio`, interpretacion: `Eficiencia del mantenimiento` },
        { cat: `Correctivo`, nombre: `Fallas en operación`, formula: `Número de fallas en operación`, interpretacion: `Nivel de confiabilidad` },
        { cat: `Revisión`, nombre: `% revisiones conformes`, formula: `(Revisiones OK / total revisiones) × 100`, interpretacion: `Condición real de activos` },
        { cat: `Costos`, nombre: `Costo por activo`, formula: `Costo total / número de activos`, interpretacion: `Eficiencia del gasto` },
        { cat: `Proveedores`, nombre: `Desempeño de proveedores (%)`, formula: `(Servicios a tiempo / total servicios externos) × 100`, interpretacion: `Cumplimiento de talleres externos` }
    ],
    roles: [
        { rol: `Operador / Chofer`, resp: `Condiciones básicas`, act: `Ejecutar checklist pre-operativo, detectar fugas, reportar, detener operación si aplica`, etapa: `1` },
        { rol: `Técnico de mantenimiento`, resp: `Ejecución técnica`, act: `Revisión técnica, diagnóstico, ejecución preventivo/correctivo, registro`, etapa: `1, 2, 3, 4, 5, 7` },
        { rol: `Encargado mantenimiento`, resp: `Dueño del proceso`, act: `Validar diagnóstico, priorizar, programar, supervisar, validación final`, etapa: `2, 3, 4, 6, 7, 8, 9, 10` },
        { rol: `Auxiliar administrativo`, resp: `Control documental`, act: `Asegurar registro, cerrar evento, costear`, etapa: `5, 9` },
        { rol: `Coordinador operaciones`, resp: `Disponibilidad operativa`, act: `Agendar servicios, coordinar activo`, etapa: `6` },
        { rol: `Finanzas / Tesorería`, resp: `Impacto financiero`, act: `Autorizar cotizaciones, pagos a externos`, etapa: `Transversal` },
        { rol: `Dirección / Gerencia`, resp: `Supervisar`, act: `Definir líneas estratégicas, KPIs`, etapa: `10` }
    ],
    riesgos: [
        { riesgo: `Operación de unidad insegura`, causa: `Omisión de inspección`, impacto: `Crítico`, prob: `Media`, sev: `Crítica`, control: `Bloqueo automático si excede tolerancias / Fuera de servicio`, tipo: `Preventivo`, etapa: `Detección`, resp: `Sistema/Encargado` },
        { riesgo: `No ejecución de preventivo`, causa: `Mala programación`, impacto: `Alto`, prob: `Media`, sev: `Alta`, control: `Alertas y bloqueo por Km/horas`, tipo: `Preventivo`, etapa: `Programación`, resp: `Sistema/Ops` },
        { riesgo: `Cierre sin validación técnica`, causa: `Falta de supervisión`, impacto: `Alto`, prob: `Media`, sev: `Alta`, control: `Pruebas operativas obligatorias antes de cierre`, tipo: `Preventivo`, etapa: `Validación final`, resp: `Encargado` },
        { riesgo: `Exceso de correctivos`, causa: `Mal diagnóstico`, impacto: `Alto`, prob: `Media`, sev: `Media`, control: `Paso central de Revisión Técnica detallada`, tipo: `Preventivo`, etapa: `Revisión`, resp: `Encargado` }
    ],
    formatos: [], // No tiene `Formatos sugeridos`
    diagrama: {
        url: `https://www.figma.com/board/LcHyLrp5TAAwHA8NlENxst/Procesos-Bloque-1--Compras--Almacen--Mantenimiento-?node-id=431-3064`,
        img: `img/Proceso Mantenimiento.jpg`,
        text: `Ver diagrama completo de Mantenimiento`
    }
}
};

// ==========================================
// Main Application Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
    const sidebar = document.getElementById("sidebar");
    const hamburger = document.querySelector(".hamburger");
    const navItems = document.querySelectorAll(".nav-item");
    const contentContainer = document.getElementById("dynamic-content-container");

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        sidebar.classList.toggle("active");
    });

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            navItems.forEach(nav => nav.classList.remove("active"));
            const btn = e.currentTarget;
            btn.classList.add("active");
            
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("active");
                hamburger.classList.remove("active");
            }
            
            const target = btn.getAttribute("data-target");
            renderContent(target);
        });
    });

    renderContent("pagos-contexto");

    function renderContent(target) {
        const parts = target.split("-");
        const processKey = parts[0]; 
        const viewKey = parts[1];    

        const processData = pdfData[processKey];
        if (!processData) return;

        contentContainer.classList.remove("fade-in");
        void contentContainer.offsetWidth; 
        
        let htmlContent = "";
        
        const headerHtml = `
            <div class="content-header">
                <div class="content-icon-box">${processData.contexto.icon}</div>
                <div>
                    <h1 class="content-title">${processData.contexto.title}</h1>
                </div>
            </div>
        `;

        switch (viewKey) {
            case "contexto":
                htmlContent = `
                    <div class="content-card">
                        ${headerHtml}
                        <h2 class="content-subtitle">Objetivo del Proceso</h2>
                        <p class="content-text">${processData.contexto.objetivo}</p>
                        
                        <div class="alert-box">
                            <div class="alert-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                Alcance
                            </div>
                            <p class="content-text" style="margin:0">${processData.contexto.alcance}</p>
                        </div>
                    </div>
                `;
                break;

            case "proceso":
                const stepsHtml = processData.proceso.map(step => `
                    <div class="process-step">
                        <div class="step-number">Etapa ${step.step} - Actor: ${step.actor}</div>
                        <div class="step-title">${step.title}</div>
                        <ul class="content-list" style="margin: 0.5rem 0 0 0;">
                            <li><strong>Actividades:</strong> <div style="margin-top:4px; font-size:0.9rem;">${step.desc.replace(/\n/g, '<br>')}</div></li>
                            ${step.consid && step.consid !== "-" ? `<li><strong>Consideraciones/Reglas:</strong> <div style="margin-top:4px; font-size:0.9rem;">${step.consid.replace(/\n/g, '<br>')}</div></li>` : ''}
                            ${step.res && step.res !== "-" ? `<li><strong>Resultado:</strong> <div style="margin-top:4px; font-size:0.9rem;">${step.res.replace(/\n/g, '<br>')}</div></li>` : ''}
                        </ul>
                    </div>
                `).join("");
                
                const subsHtml = (processData.subprocesos && processData.subprocesos.length > 0) ? processData.subprocesos.map(sub => `
                    <div class="alert-box" style="margin-top:1rem;">
                        <div class="alert-title">${sub.title}</div>
                        <p class="content-text" style="margin:0;">${sub.desc.replace(/\n/g, '<br>')}</p>
                    </div>
                `).join("") : "";

                htmlContent = `
                    <div class="content-card">
                        ${headerHtml}
                        <h2 class="content-subtitle">Flujo del Proceso TO-BE</h2>
                        <p class="content-text">Desglose detallado de actividades, consideraciones y resultados esperados por etapa.</p>
                        <div style="margin-top: 2rem;">
                            ${stepsHtml}
                        </div>
                        ${subsHtml ? `<h2 class="content-subtitle" style="margin-top:2rem;">Subprocesos Relacionados</h2>${subsHtml}` : ""}
                    </div>
                `;
                break;

            case "reglas":
                const rulesHtml = processData.reglas.map(rule => `<li>${rule}</li>`).join("");
                
                htmlContent = `
                    <div class="content-card">
                        ${headerHtml}
                        <h2 class="content-subtitle">Reglas de Negocio</h2>
                        <p class="content-text">Políticas estrictas y controles que el sistema y los usuarios deben respetar durante el flujo operativo.</p>
                        
                        <div class="alert-box" style="border-left-color: var(--secondary-color); background-color: #EFF6FF;">
                            <div class="alert-title" style="color: var(--secondary-color);">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                Lineamientos Obligatorios
                            </div>
                            <ul class="content-list" style="margin-top: 1rem;">
                                ${rulesHtml}
                            </ul>
                        </div>
                    </div>
                `;
                break;

            case "kpis":
                const kpisRowsHtml = processData.kpis.map(kpi => `
                    <tr>
                        <td style="font-weight: 500; color: #64748B;">${kpi.cat}</td>
                        <td style="font-weight: 600; color: var(--primary-color);">${kpi.nombre}</td>
                        <td>${kpi.formula}</td>
                        <td>${kpi.interpretacion}</td>
                    </tr>
                `).join("");
                
                htmlContent = `
                    <div class="content-card">
                        ${headerHtml}
                        <h2 class="content-subtitle">Indicadores Clave de Rendimiento (KPIs)</h2>
                        <p class="content-text">Métricas utilizadas para medir la eficiencia, control financiero y calidad del proceso.</p>
                        
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Categoría</th>
                                        <th>KPI</th>
                                        <th>Cómo se calcula / Fórmula</th>
                                        <th>Interpretación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${kpisRowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                break;

            case "roles":
                const rolesRowsHtml = processData.roles.map(rol => `
                    <tr>
                        <td style="font-weight: 600; color: var(--primary-color);">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div style="width:8px; height:8px; border-radius:50%; background-color:var(--secondary-color);"></div>
                                ${rol.rol}
                            </div>
                        </td>
                        <td>${rol.resp}</td>
                        <td><div style="font-size:0.85rem;">${rol.act.replace(/\n/g, '<br>')}</div></td>
                        <td><div style="background-color:#EFF6FF; color:var(--secondary-color); padding:0.5rem; border-radius:8px; font-size:0.8rem; font-weight:600; margin:0;">${rol.etapa.replace(/\n/g, '<br>')}</div></td>
                    </tr>
                `).join("");
                
                htmlContent = `
                    <div class="content-card">
                        ${headerHtml}
                        <h2 class="content-subtitle">Roles y Responsabilidades</h2>
                        <p class="content-text">Actores involucrados en la ejecución y control, con sus actividades clave por etapa.</p>
                        
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Rol / Actor</th>
                                        <th>Responsabilidad Principal</th>
                                        <th>Actividades Clave</th>
                                        <th>Etapas donde participa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rolesRowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                break;
                
            case "riesgos":
                const renderBadge = (val, type) => {
                    let color = "#475569", bg = "#F1F5F9"; 
                    if (val === "Alta" || val === "Crítica" || val === "Alto" || val === "Crítico") { color = "#E03131"; bg = "#FFE5E5"; }
                    if (val === "Media" || val === "Medio") { color = "#E8590C"; bg = "#FFF4E6"; }
                    if (val === "Baja" || val === "Bajo") { color = "#08A045"; bg = "#E6FCF5"; }
                    if (type === "control") {
                        if (val.includes("Preventivo")) { color = "#1971C2"; bg = "#E7F5FF"; }
                        else { color = "#6741D9"; bg = "#F3F0FF"; }
                    }
                    return `<span style="background-color:${bg}; color:${color}; padding:0.3rem 0.6rem; border-radius:20px; font-size:0.8rem; font-weight:600; white-space:nowrap;">${val}</span>`;
                };

                const riesgosRowsHtml = processData.riesgos.map(r => `
                    <tr>
                        <td style="font-weight: 600; color: var(--primary-color);">${r.riesgo}</td>
                        <td style="font-size:0.85rem;">${r.causa}</td>
                        <td style="font-size:0.85rem;">${r.impacto}</td>
                        <td>${renderBadge(r.prob)}</td>
                        <td>${renderBadge(r.sev)}</td>
                        <td style="font-size:0.85rem; max-width:200px;">${r.control}</td>
                        <td>${renderBadge(r.tipo, "control")}</td>
                        <td style="font-size:0.85rem;">${r.etapa}</td>
                        <td style="font-weight:500;">${r.resp}</td>
                    </tr>
                `).join("");

                htmlContent = `
                    <div class="content-card" style="max-width: 100%;">
                        ${headerHtml}
                        <h2 class="content-subtitle">Matriz de Riesgos y Control</h2>
                        <p class="content-text">Identificación, evaluación y mitigación de riesgos asociados a las operaciones del proceso.</p>
                        
                        <div class="table-container">
                            <table style="min-width: 1000px;">
                                <thead>
                                    <tr>
                                        <th>Riesgo</th>
                                        <th>Causa Raíz</th>
                                        <th>Impacto</th>
                                        <th>Probabilidad</th>
                                        <th>Severidad</th>
                                        <th>Control(es)</th>
                                        <th>Tipo Control</th>
                                        <th>Etapa</th>
                                        <th>Responsable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${riesgosRowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                break;
                
            
            case "formatos":
                if (!processData.formatos || processData.formatos.length === 0) {
                    htmlContent = `
                        <div class="content-card">
                            ${headerHtml}
                            <h2 class="content-subtitle">Formatos Sugeridos</h2>
                            <p class="content-text">No hay formatos sugeridos documentados para este proceso.</p>
                        </div>`;
                    break;
                }
                const formatosHtml = processData.formatos.map(f => `
                    <div class="alert-box" style="border-left-color: var(--primary-color); background-color: #F8FAFC; margin-bottom: 1rem;">
                        <div class="alert-title" style="color: var(--primary-color);">${f.title}</div>
                        <p style="margin: 8px 0; font-size: 0.9rem;"><strong>Objetivo:</strong> ${f.objetivo}</p>
                        <p style="margin: 8px 0; font-size: 0.9rem;"><strong>Campos clave:</strong> ${f.campos}</p>
                        <p style="margin: 8px 0; font-size: 0.9rem;"><strong>Uso en el proceso:</strong> ${f.uso}</p>
                    </div>
                `).join("");
                
                htmlContent = `
                    <div class="content-card">
                        ${headerHtml}
                        <h2 class="content-subtitle">Formatos Sugeridos</h2>
                        <p class="content-text">Documentos y formatos recomendados para la operación de este proceso.</p>
                        <div style="margin-top: 1.5rem;">
                            ${formatosHtml}
                        </div>
                    </div>
                `;
                break;

            case "diagrama":
                let btnHtml = "";
                if (processData.diagrama.url && processData.diagrama.url !== "#") {
                    btnHtml = `
                    <div style="text-align:center; margin-top:1.5rem;">
                        <a href="${processData.diagrama.url}" target="_blank" style="display:inline-flex; align-items:center; gap:8px; background-color:var(--secondary-color); color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:600; transition: background-color 0.3s ease;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            ${processData.diagrama.text}
                        </a>
                    </div>`;
                }

                htmlContent = `
                    <div class="content-card">
                        ${headerHtml}
                        <h2 class="content-subtitle">Diagrama de Flujo del Proceso</h2>
                        <p class="content-text">Representación visual de la secuencia de pasos y tomas de decisión del proceso TO-BE.</p>
                        
                        <div style="text-align:center; margin-top:2rem; overflow-x:auto;">
                            <img src="${processData.diagrama.img}" alt="Diagrama de ${processData.contexto.title}" style="max-width:100%; border-radius:8px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
                        </div>
                        ${btnHtml}
                    </div>
                `;
                break;
        }

        contentContainer.innerHTML = htmlContent;
        contentContainer.classList.add("fade-in");
    }

});
