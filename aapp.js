// Base de datos estructurada a partir de los documentos PDF y DOCX (Cambios)
const pdfData = {
    pagos: {
        contexto: {
            icon: "🌐",
            title: "Gestión de Pagos",
            objetivo: "Garantizar que los pagos a proveedores (generadores) se realicen de forma correcta, trazable, oportuna y controlada, utilizando información confiable proveniente de MUTA, alineada a reglas financieras y validaciones administrativas.",
            alcance: "Desde la extracción de datos en MUTA hasta la ejecución del pago y conciliación contable, incluyendo validación, consolidación, cálculo, orden de pago, facturación, aprobación y control."
        },
        proceso: [
            { step: "0", title: "Validación Operativa (Antes de cada extracción)", actor: "Logística y Recolección", desc: "Validar en campo:<br>• Registro de recolección<br>• Kilos capturados<br>• Evidencias (foto, firma, nombre)<br>• Dirección correcta", consid: "• Las evidencias son obligatorias en MUTA (candado operativo)", res: "-" },
            { step: "1", title: "Extracción de datos desde MUTA", actor: "Administración", desc: "• Descarga de reporte de recolecciones desde MUTA:<br>  o Código interno generador<br>  o Fecha de recolección<br>  o Estado<br>  o Dirección<br>  o Metodo de pago*<br>  o Tags Generador<br>  o Id legal Generador = RFC*<br>  o Kilos (netos/brutos)<br>  o Precio", consid: "", res: "• Dataset base de recolecciones" },
            { step: "2", title: "Validación operativa (Filtro de registros)", actor: "Administración", desc: "• Filtrar registros con estado válido para pago:<br>  o Completado<br>  o Verificado<br>• Validar:<br>  o Integridad de datos (RFC, kilos, precio)<br>  o No duplicidad de registros", consid: "• Las inconsistencias no bloquean el pago, pero deben registrarse como incidencias, darles seguimiento y corregirse en un flujo paralelo. Solo aquellas que afecten directamente el monto (kilos o precio) deberán resolverse antes del cálculo.", res: "• Registros válidos para procesamiento de pago" },
            { step: "3", title: "Consolidación de información", actor: "Administración", desc: "• Agrupar información por:<br>  o Cliente<br>  o Periodo (día / semana / quincena)<br>• Aplicar reglas:<br>  o Monto mínimo ($500)<br>  o Exclusión de registros inválidos", consid: "", res: "• Base consolidada por cliente y periodo" },
            { step: "4", title: "Cálculo de pagos", actor: "Administración", desc: "• Calcular monto por cliente:<br>  o Kilos x Precio (según contrato)<br>• Validar:<br>  o Consistencia de kilos (MUTA vs sistema actual)<br>  o Precio vigente<br>• Herramientas de validación IA (Prompt)<br><br>Exclusiones:<br>• Penalizaciones (se gestionan en subproceso independiente)", consid: "", res: "• Monto total a pagar por cliente" },
            { step: "5", title: "Generación de Orden de Pago", actor: "Administración", desc: "• Generar documento orden de pago estándar que incluye:<br>  o Cliente<br>  o Periodo<br>  o Kilos<br>  o Monto total<br>  o Referencia de recolecciones<br>• Enviar orden de pago al cliente<br>• Solicita factura", consid: "", res: "• Orden de pago enviada" },
            { step: "6", title: "Facturación (Cliente)", actor: "Cliente", desc: "• Recibir orden de pago<br>• Emitir factura<br>• Enviar factura", consid: "", res: "Factura emitida y enviada por el cliente, alineada con la orden de pago generada" },
            { step: "7", title: "Recepción y validación de factura", actor: "Administración", desc: "• Recepción de factura por parte del cliente<br>• Validación de:<br>  o RFC correcto<br>  o Monto coincidente<br>  o Datos fiscales completos<br><br>Regla crítica:<br>• Sin factura → NO se procesa el pago<br>• Factura incorrecta → rechazo<br>• Factura válida → continuar con el proceso", consid: "", res: "• Factura validada y autorizada" },
            { step: "8", title: "Aprobación financiera", actor: "Administración / Tesorería", desc: "• Nivel 1: Administración<br>  o Validación final de:<br>    ▪ Cálculo<br>    ▪ Orden de pago<br>    ▪ Factura<br>• Nivel 2: Tesorería<br>  o Validación de:<br>    ▪ Disponibilidad de fondos<br><br>Decisión:<br>• Rechazado → Corrección / Aplazamiento: El pago puede ser rechazado por errores en cálculo, factura o información, en cuyo caso se corrige y revalida. También puede aplazarse por causas operativas como falta de fondos o factura pendiente, sin reiniciar el proceso.<br>• Aprobado → ejecución", consid: "", res: "• Pago autorizado" },
            { step: "9", title: "Ejecución del pago", actor: "Tesorería", desc: "• Realizar transferencia (SPEI / bancaria)<br>• Registrar:<br>  o Referencia bancaria<br>  o Fecha de pago<br>  o Monto pagado", consid: "", res: "• Pago ejecutado" },
            { step: "10", title: "Notificación al cliente", actor: "Administración", desc: "• Enviar confirmación de pago:<br>  o Comprobante<br>  o Detalle del pago", consid: "", res: "• Cliente notificado" },
            { step: "11", title: "Registro y conciliación", actor: "Administración / Finanzas", desc: "• Registro contable del pago<br>• Conciliación bancaria<br>• Cierre del periodo", consid: "", res: "• Proceso cerrado y conciliado" }
        ],
        subprocesos: [
            { title: "Subproceso relacionado “Gestión de Penalizaciones”", desc: "• Se gestiona fuera del flujo principal\n• No bloquea pagos\n• Puede afectar ajustes posteriores o compensaciones\n• Penalizaciones a Clientes se aplican cuando el cliente incumple condiciones acordadas, por ejemplo:\n  o Entrega de material fuera de especificación (contaminación, mezcla indebida)\n  o Diferencias relevantes entre volumen reportado vs recibido\n  o Incumplimiento de condiciones logísticas (accesos, tiempos, preparación)\n  o Visitas en cero\n  o Retrasos en servicio\n  o Falta de cumplimiento en procesos administrativos (ej. retraso en facturación, si se decide aplicar)\n  ▪ Impacto:\n    • Ajuste en el monto a pagar (reducción)\n    • Registro como incidencia contractual\n• Penalizaciones a Proveedores, se aplican cuando la operación interna o proveedores incumplen estándares definidos, por ejemplos:\n  o Registro incorrecto de datos (kilos, dirección, cliente)\n  o Retrasos operativos\n  ▪ Impacto:\n    • Puede generar:\n      o Ajustes internos\n      o Evaluación de desempeño\n      o Penalización económica interna (si aplica)" },
            { title: "Subproceso Relacionado “Soporte TI”", desc: "• Soporte a incidencias operativas, se atienden problemas relacionados con el uso del sistema en la operación diaria, por ejemplo:\n  o Error en la descarga de reportes de MUTA\n  o Fallas en accesos o permisos de usuarios\n  o Problemas en visualización de información (precios, kilos, estados)\n• Soporte a calidad de datos, se enfoca en la corrección y validación de información utilizada en pagos, por ejemplo:\n  o Corrección de direcciones incorrectas\n  o Ajustes en registros duplicados\n• Soporte evolutivo (mejoras al sistema), se enfoca en la evolución del sistema para mejorar el proceso, por ejemplo:\n  o Incorporación de nuevos campos requeridos\n  o Ajustes en reportes de MUTA" }
        ],
        reglas: [
            "Validación de información<br>• Integridad de datos obligatoria, todo registro de recolección debe contar con:<br>  o RFC del cliente<br>  o Kilos<br>  o Precio<br>  o Estado válido<br>• Estados válidos para pago, solo se procesan registros con estado:<br>  o Verificado<br>• No se permiten procesar registros duplicados:<br>  o Variables:<br>    ▪ ID_Recolección<br>    ▪ Fecha_Recolección<br>    ▪ Cliente<br>  o Clave única sugerida:<br>    ID_Recolección + Fecha_Recolección + Cliente<br>• MUTA es la única fuente de datos operativos para el pago.<br>• Manejo de inconsistencias, las inconsistencias:<br>  o No bloquean el flujo<br>  o Se registran como incidencias<br>  o Excepción:<br>    Si afectan el monto (kilos o precio) → deben corregirse antes del cálculo",
            "Cálculo de pagos<br>• La base para el cálculo es sobre los Kilos Netos<br>• El monto se calcula de la siguiente manera:<br>• Fórmula:<br>  Monto_Pago = Kilos_Netos × Precio_Contrato<br>• El precio por kilo debe estar definido en el contrato y debe de coincidir con el registro en MUTA.<br>• Las penalizaciones no afectan el cálculo inicial y se gestionan en un subproceso independiente llamado “Gestión de Penalizaciones”",
            "Reglas financieras<br>• Pagos menores a $500 no se procesan y se acumulan.<br>  Regla:<br>  o Si Monto_Pago < Monto_Mínimo → se acumula<br>  o Si Monto_Pago ≥ Monto_Mínimo → se paga<br>• Los pagos solo se ejecutan en periodos definidos:<br>  o Principios de mes<br>  o Finales de mes<br>• Todo pago debe contar con un folio único.",
            "Facturación<br>• No se puede ejecutar un pago sin factura válida.<br>• La factura debe pasar por una validación fiscal considerando las siguientes variables:<br>  o RFC_Factura<br>  o Monto_Factura<br>  o Datos_Fiscales<br>  o Debe cumplir:<br>    ▪ RFC correcto<br>    ▪ Monto coincide con orden<br>    ▪ Datos completos<br>• El monto de la factura debe coincidir con la orden de pago.<br>  Regla:<br>  Monto_Factura = Monto_Orden_Pago",
            "Operación y control<br>• Las evidencias son obligatorias en MUTA, pero no bloquean el pago:<br>  o Foto<br>  o Firma<br>  o Nombre<br>• Las inconsistencias deben registrarse, clasificarse y tener seguimiento, pero sin detener el proceso.<br>• Todo cambio en datos (precio, kilos, cliente) debe quedar registrado en un historial<br>• Debe existir separación de funciones entre validación (Administración) y ejecución (Tesorería).<br>• Todo pago debe quedar registrado en el sistema, incluyendo su estado: realizado, pendiente o acumulado para periodos posteriores.<br>• No se puede ejecutar un pago si no se cumple:<br>  o Validación → Cálculo → Factura → Aprobación",
            "Reglas de penalizaciones<br>• Las penalizaciones se establecen en contrato y pueden ser aplicables considerando los siguientes pasos:<br>  o Visitas en cero<br>  o Retrasos en servicio<br>  o Incumplimientos operativos"
        ],
        kpis: [
            { cat: "-", nombre: "Tiempo total de ciclo de pago", formula: "Fecha pago – Fecha extracción", interpretacion: "Menor tiempo = mayor eficiencia" },
            { cat: "-", nombre: "Tiempo de espera de factura", formula: "Fecha factura – Fecha orden", interpretacion: "Alto = retraso del cliente" },
            { cat: "-", nombre: "% de pagos en tiempo", formula: "(Pagos en tiempo / Total) × 100", interpretacion: "<80% indica problemas" },
            { cat: "-", nombre: "% de pagos con errores", formula: "(Pagos con error / Total) × 100", interpretacion: "Ideal <5%" },
            { cat: "-", nombre: "Monto total pagado", formula: "Σ pagos", interpretacion: "Control financiero" },
            { cat: "-", nombre: "Costo por kilo", formula: "Total pagado / Total kilos", interpretacion: "Base para margen" },
            { cat: "-", nombre: "% registros con inconsistencias", formula: "(Registros con error / Total) × 100", interpretacion: "Alto = problema operativo" },
            { cat: "-", nombre: "% facturas a tiempo", formula: "(Facturas a tiempo / Total) × 100", interpretacion: "Bajo = retrasos externos" },
            { cat: "-", nombre: "Monto acumulado (<$500)", formula: "Σ pagos menores a $500", interpretacion: "Alto = muchos pagos pequeños" },
            { cat: "-", nombre: "% pagos sin factura", formula: "(Pagos sin factura / Total) × 100", interpretacion: "Debe ser 0%" },
            { cat: "-", nombre: "% pagos conciliados", formula: "(Pagos conciliados / Total) × 100", interpretacion: "Cercano a 100%" }
        ],
        roles: [
            { rol: "Logística y Recolección", resp: "Validar la información operativa en campo", act: "- Registrar recolecciones en MUTA\n- Capturar kilos (netos/brutos)\n- Adjuntar evidencias (foto, firma, nombre)\n- Validar dirección y ejecución del servicio\n- Detectar incidencias (visitas en cero, retrasos)", etapa: "0. Validación operativa" },
            { rol: "Administración (Back Office / Pagos)", resp: "Gestionar el proceso completo de pagos (rol core)", act: "- Descargar datos de MUTA\n- Validar información (RFC, kilos, precio, estado) - Eliminar duplicados\n- Registrar incidencias\n- Consolidar información por cliente/periodo\n- Aplicar reglas (mínimo $500) - Calcular pagos (kilos netos × precio)\n- Generar orden de pago\n- Enviar orden y solicitar factura - Validar factura\n- Gestionar correcciones\n- Notificar al cliente", etapa: "1. Extracción\n2. Validación administrativa\n3. Consolidación\n4. Cálculo\n5. Orden de pago\n7. Validación de factura\n8. Aprobación (Nivel 1)\n9. Notificación" },
            { rol: "Cliente (Generador)", resp: "Emitir factura y recibir pago", act: "- Recibir orden de pago\n- Generar factura\n- Enviar factura a Sonne\n- Atender correcciones si aplica\n- Confirmar recepción del pago", etapa: "6. Facturación\n7. Corrección de factura\n9. Recepción de notificación" },
            { rol: "Tesorería", resp: "Validar y ejecutar el pago", act: "- Validar disponibilidad de fondos\n- Aprobar pago (nivel 2)\n- Ejecutar transferencia bancaria\n- Registrar referencia de pago\n- Reprogramar pagos si no hay fondos", etapa: "8. Aprobación (Nivel 2)\n9. Ejecución del pago" },
            { rol: "Contabilidad / Finanzas", resp: "Registrar y conciliar los pagos", act: "- Registrar pago en sistema contable\n- Conciliar contra banco\n- Validar cierre de periodo\n- Generar reportes financieros", etapa: "10. Registro y conciliación" },
            { rol: "(Soporte TI)", resp: "Garantizar disponibilidad, calidad de datos y soporte técnico", act: "- Soporte a incidencias en MUTA\n- Validar y corregir datos (kilos, direcciones, precios)\n- Ajustar reportes o campos\n- Soporte en automatización (IA, integraciones)\n- Mantener trazabilidad de cambios", etapa: "Transversal (todas las etapas)" },
            { rol: "Administración (Control / Auditoría interna)", resp: "Control y trazabilidad del proceso", act: "- Mantener bitácora de pagos (realizados / pendientes)\n- Mantener bitácora de cambios (precios, kilos, clientes)\n- Validar cumplimiento de reglas\n- Seguimiento a incidencias", etapa: "Transversal (control del proceso)" }
        ],
        riesgos: [
            { riesgo: "Pago incorrecto", causa: "Error en cálculo o datos inconsistentes", impacto: "Alto", prob: "Media", sev: "Alta", control: "Validación de cálculo (kilos netos × precio), revisión en aprobación Nivel 1", tipo: "Preventivo / Detectivo", etapa: "Cálculo / Aprobación", resp: "Administración" },
            { riesgo: "Pago sin factura", causa: "Omisión en validación", impacto: "Alto", prob: "Baja", sev: "Alta", control: "Regla: pago no procede sin factura válida", tipo: "Preventivo", etapa: "Validación de factura", resp: "Administración" },
            { riesgo: "Duplicidad de pago", causa: "Datos inconsistentes", impacto: "Se paga más de una vez la misma recolección", prob: "Media", sev: "Alta", control: "Validación de duplicidad (ID + fecha + cliente)", tipo: "Preventivo", etapa: "Validación administrativa", resp: "Administración" },
            { riesgo: "Error en kilos (netos)", causa: "Datos erróneos (kilos, precio, cliente)", impacto: "Uso incorrecto de kilos netos afecta pago", prob: "Media", sev: "Alta", control: "Registro de incidencias + validación previa al cálculo", tipo: "Detectivo", etapa: "Cálculo", resp: "Administración" },
            { riesgo: "Falta de evidencias", causa: "Recolección sin respaldo visual", impacto: "Falta de control en campo", prob: "Media", sev: "Media", control: "Candado en MUTA (evidencias obligatorias)", tipo: "Preventivo", etapa: "Validación operativa", resp: "Logística" },
            { riesgo: "Pago fuera de periodo", causa: "Pago fuera de fechas definidas", impacto: "Falta de control de periodos", prob: "Baja", sev: "Media", control: "Validación de periodo antes de aprobación", tipo: "Preventivo", etapa: "Consolidación / Aprobación", resp: "Administración" },
            { riesgo: "Pago sin aprobación", causa: "Se ejecuta pago sin validación interna", impacto: "Falta de control de flujo", prob: "Media", sev: "Alta", control: "Aprobación en 2 niveles (Administración / Tesorería)", tipo: "Preventivo", etapa: "Aprobación", resp: "Administración / Tesorería" },
            { riesgo: "Falta de fondos", causa: "No hay liquidez para ejecutar pagos", impacto: "Mala planeación financiera", prob: "Media", sev: "Alta", control: "Validación de disponibilidad en Tesorería", tipo: "Preventivo", etapa: "Aprobación Nivel 2", resp: "Tesorería" },
            { riesgo: "Retraso en facturación", causa: "Cliente no envía factura a tiempo", impacto: "Dependencia externa", prob: "Media", sev: "Alta", control: "Seguimiento a cliente + control de tiempos", tipo: "Detectivo", etapa: "Facturación", resp: "Administración" },
            { riesgo: "Factura incorrecta", causa: "Factura con errores fiscales", impacto: "Error del cliente", prob: "Media", sev: "Media", control: "Validación de factura (RFC, monto, datos)", tipo: "Detectivo", etapa: "Validación de factura", resp: "Administración" },
            { riesgo: "Datos bancarios incorrectos", causa: "Transferencia a cuenta errónea", impacto: "Falta de control de datos bancarios", prob: "Media", sev: "Media", control: "Validación en fuente externa (Excel controlado)", tipo: "Preventivo", etapa: "Ejecución del pago", resp: "Tesorería" },
            { riesgo: "Incidencias no atendidas", causa: "Errores no corregidos", impacto: "Falta de seguimiento", prob: "Media", sev: "Media", control: "Registro y seguimiento de incidencias", tipo: "Detectivo", etapa: "Validación administrativa", resp: "Administración" },
            { riesgo: "Penalizaciones mal aplicadas", causa: "Ajustes incorrectos al cliente/proveedor", impacto: "Falta de reglas claras", prob: "Media", sev: "Media", control: "Definición contractual + validación previa", tipo: "Preventivo", etapa: "Subproceso penalizaciones", resp: "Administración" },
            { riesgo: "Visitas en cero no controladas", causa: "Costos logísticos sin control", impacto: "Falta de registro", prob: "Media", sev: "Media", control: "Registro de incidencias + control contractual", tipo: "Detectivo", etapa: "Operación / Penalizaciones", resp: "Logística / Administración" },
            { riesgo: "Error en conciliación", causa: "Diferencias con banco", impacto: "Registro incorrecto", prob: "Media", sev: "Alta", control: "Conciliación bancaria obligatoria", tipo: "Detectivo", etapa: "Conciliación", resp: "Finanzas" }
        ],
        diagrama: {
            url: "https://miro.com/app/board/uXjVHYBgbLA=/?share_link_id=875147726717",
            img: "img/image.png", 
            text: "Ver diagrama completo de Pagos en Miro"
        }
    },
    compras: {
        contexto: {
            icon: "🛒",
            title: "Gestión de Compras",
            objetivo: "Optimizar el proceso de compras mediante automatización, control presupuestal y trazabilidad en tiempo real, garantizando eficiencia operativa, reducción de costos y cumplimiento normativo.",
            alcance: "Abarca desde la identificación de la necesidad hasta el pago al proveedor y la evaluación de su desempeño."
        },
        proceso: [
            { step: "1", title: "Detección de necesidad", actor: "Solicitante / Sistema", desc: "• La necesidad puede originarse por:<br>  o Requerimiento operativo (usuario)<br>  o Stock mínimo (inventario)<br>  o Mantenimiento programado (operaciones / MUTA)<br>• El sistema puede sugerir:<br>  o Proveedores frecuentes<br>  o Precios históricos<br>  o Tiempos de entrega", consid: "", res: "• Requerimiento identificado y listo para formalización" },
            { step: "2", title: "Creación de Solicitud de Compra (SC)", actor: "Solicitante", desc: "• Captura en sistema con campos obligatorios:<br>  o Tipo de compra (operativa, CAPEX, mantenimiento)<br>  o Centro de costo<br>  o Cantidad y descripción<br>  o Fecha requerida<br>  o Justificación del requerimiento<br>• Validaciones automáticas:<br>  o Catálogo de productos/servicios<br>  o Campos obligatorios completos", consid: "", res: "• Solicitud de Compra registrada (estatus: “Pendiente validación”)" },
            { step: "3", title: "Validación Presupuestal", actor: "Finanzas", desc: "• Validación de:<br>  o Disponibilidad presupuestal<br>  o Partida contable<br>  o Centro de costo<br>• Posibles escenarios:<br>  o Aprobado → se asigna presupuesto<br>  o Rechazado → regresa a solicitante<br>  o Ajuste → modificación de monto o alcance", consid: "", res: "• SC aprobada con presupuesto asignado" },
            { step: "4", title: "Flujo de Aprobación", actor: "Sistema + Aprobador", desc: "• Flujo automático basado en:<br>  o Monto de compra<br>  o Tipo de compra<br>  o Área<br>• Niveles de aprobación configurables:<br>  o Jefe directo<br>  o Gerencia<br>  o Dirección<br>• Notificaciones automáticas", consid: "", res: "• SC aprobada / rechazada" },
            { step: "5", title: "Proceso de Cotización", actor: "Compras", desc: "• Envío de solicitudes de cotización a proveedores<br>• Recepción de propuestas en sistema<br>• Comparación automática:<br>  o Precio<br>  o Tiempo de entrega<br>  o Condiciones comerciales<br>  o Score histórico del proveedo", consid: "", res: "• Cuadro comparativo de cotizaciones" },
            { step: "6", title: "Selección de Proveedor", actor: "Compras", desc: "• Análisis de propuestas<br>• Selección del proveedor óptimo (costo-beneficio)<br>• Regla clave:<br>  o Si no se selecciona la mejor opción → justificar en sistema<br>• Registro de decisión", consid: "", res: "• Proveedor seleccionado" },
            { step: "7", title: "Generación de Orden de Compra (OC)", actor: "Sistema + Compras", desc: "• Generación automática de OC basada en SC aprobada<br>• Inclusión de:<br>  o Datos del proveedor<br>  o Condiciones de pago<br>  o Fecha de entrega<br>• Envío automático al proveedor", consid: "", res: "• OC emitida y enviada" },
            { step: "8", title: "Recepción de Bienes/Servicios", actor: "Almacén / Operaciones", desc: "• Recepción física o validación del servicio<br>• Comparación contra OC:<br>  o Cantidad<br>  o Calidad<br>• Registro de evidencia:<br>  o Fotos<br>  o Firma<br>  o Documentos<br>• Manejo de incidencias:<br>  o Rechazo parcial o total", consid: "", res: "• Recepción registrada (Aceptada / Rechazada)" },
            { step: "9", title: "Validación de Factura", actor: "Sistema + Compras", desc: "• Validación automática:<br>  o Orden de compra (OC)<br>  o Recepción<br>  o Factura<br>• Escenarios:<br>  o Coincide → pasa a pago<br>  o No coincide → bloqueo + incidencia", consid: "", res: "• Factura validada" },
            { step: "10", title: "Ejecución de Pago", actor: "Tesorería", desc: "• Programación de pago según:<br>  o Condiciones acordadas<br>  o Flujo de caja<br>• Ejecución del pago<br>• Registro en sistema<br>• Notificación al proveedo", consid: "", res: "• Pago realizado" }
        ],
        subprocesos: [],
        reglas: [
            "No existe OC sin SC aprobada",
            "Toda solicitud debe contar con validación de presupuesto (Finanzas)",
            "El sistema verifica disponibilidad antes de aprobar",
            "Si excede el presupuesto:<br>  o Se bloquea el flujo<br>  o Se notifica al responsable<br>  o Se requiere autorización o rechazo",
            "Toda excepción debe incluir justificación",
            "Se registra en bitácora:<br>  o Validación realizada<br>  o Excepciones autorizadas o rechazadas<br>  o Usuario, fecha y motivo",
            "La SC no podrá ser creada si faltan campos requeridos.<br>  o Variables:<br>    ▪ tipo_compra (Operativa, Mantenimiento, ertc)<br>    ▪ centro_costo<br>    ▪ descripcion<br>    ▪ cantidad<br>    ▪ fecha_requerida<br>    ▪ justificacion",
            "Mínimo 2 cotizaciones (salvo excepción)",
            "Justificación obligatoria en decisiones de compra",
            "No se ejecuta pago sin:<br>  o OC válida<br>  o Recepción validada<br>  o Factura correcta",
            "Al seleccionar al proveedor, se debe evaluar la mejor opción costo-beneficio.<br>  o Variables:<br>    ▪ precio<br>    ▪ tiempo_entrega<br>    ▪ score_proveedor",
            "Si no se elige la mejor opción, se debe justificar."
        ],
        kpis: [
            { cat: "Eficiencia del proceso", nombre: "Tiempo total de compra", formula: "Fecha pago – Fecha solicitud", interpretacion: "Menor tiempo = mayor eficiencia" },
            { cat: "Eficiencia del proceso", nombre: "Tiempo de aprobación", formula: "Fecha aprobación – Fecha solicitud", interpretacion: "Alto = cuellos de botella" },
            { cat: "Eficiencia del proceso", nombre: "Tiempo generación OC", formula: "Fecha OC – Fecha aprobación", interpretacion: "Mide eficiencia de Compras" },
            { cat: "Eficiencia del proceso", nombre: "Tiempo de pago", formula: "Fecha pago – Fecha factura validada", interpretacion: "Impacta relación con proveedor" },
            { cat: "Control del dinero", nombre: "% compras dentro de presupuesto", formula: "(Compras dentro / total) ×100", interpretacion: "Alto = buen control financiero" },
            { cat: "Control del dinero", nombre: "% desviación presupuestal", formula: "(Gasto real – presupuesto) / presupuesto ×100", interpretacion: "Alto = sobrecostos" },
            { cat: "Control del dinero", nombre: "Ahorro en compras", formula: "(Precio estimado – real) / estimado ×100", interpretacion: "Alto = buena negociación" },
            { cat: "Control del dinero", nombre: "% compras con excepción", formula: "(Compras excepción / total) ×100", interpretacion: "Alto = riesgo de malas decisiones" },
            { cat: "Gestión de compras", nombre: "% compras con RFQ", formula: "(Compras con RFQ / total) ×100", interpretacion: "Alto = mayor control" },
            { cat: "Gestión de compras", nombre: "Tiempo selección proveedor", formula: "Fecha selección – fecha cotización", interpretacion: "Bajo = eficiencia" },
            { cat: "Gestión de compras", nombre: "% cumplimiento proceso", formula: "(Compras correctas / total) ×100", interpretacion: "Bajo = riesgo de auditoría" },
            { cat: "Entregas y operación", nombre: "% entregas a tiempo", formula: "(Entregas a tiempo / total) ×100", interpretacion: "Bajo = proveedor deficiente" },
            { cat: "Entregas y operación", nombre: "% entregas sin error", formula: "(Entregas correctas / total) ×100", interpretacion: "Bajo = problemas operativos" },
            { cat: "Entregas y operación", nombre: "% incidencias", formula: "(Recepciones con error / total) ×100", interpretacion: "Alto = fallas operativas" },
            { cat: "Pagos (Tesorería)", nombre: "% pagos a tiempo", formula: "(Pagos a tiempo / total) ×100", interpretacion: "Alto = buena tesorería" },
            { cat: "Pagos (Tesorería)", nombre: "Tiempo promedio de pago", formula: "Promedio (Fecha pago – factura)", interpretacion: "Bajo = buena liquidez" },
            { cat: "Pagos (Tesorería)", nombre: "% pagos con error", formula: "(Pagos con error / total) ×100", interpretacion: "Alto = riesgo financiero" },
            { cat: "Control y cumplimiento", nombre: "% compras fuera del proceso", formula: "(Compras fuera / total) ×100", interpretacion: "Alto = riesgo de fraude" },
            { cat: "Control y cumplimiento", nombre: "% compras urgentes", formula: "(Compras urgentes / total) ×100", interpretacion: "Alto = mala planeación" },
            { cat: "Control y cumplimiento", nombre: "% cumplimiento", formula: "(Pagos validados / total) ×100", interpretacion: "Bajo = riesgo de pago indebido" },
            { cat: "Proveedores", nombre: "Calificación de proveedores", formula: "Promedio (calidad + tiempo + cumplimiento)", interpretacion: "Bajo = proveedor riesgoso" },
            { cat: "Proveedores", nombre: "% proveedores evaluados", formula: "(Evaluados / total) ×100", interpretacion: "Bajo = falta de seguimiento" },
            { cat: "Operación", nombre: "Indicador de compras (volumen)", formula: "Total SC/OC en periodo", interpretacion: "Mide carga operativa" },
            { cat: "Operación", nombre: "Tiempo por solicitud", formula: "Promedio (Fecha fin – inicio)", interpretacion: "Mide eficiencia por caso" }
        ],
        roles: [
            { rol: "Solicitante (Área operativa / usuario interno)", resp: "Identificar y registrar necesidades de compra", act: "- Detectar necesidad (manual o automática)\n- Crear solicitud de compra (SC)\n- Definir requerimientos (cantidad, tipo, urgencia)\n- Dar seguimiento a su solicitud", etapa: "1. Detección de necesidad\n2. Creación de SC" },
            { rol: "Sistema / Workflow (ERP / Plataforma)", resp: "Automatizar, validar y orquestar el proceso", act: "- Validar datos y catálogos\n- Ejecutar workflow de aprobación\n- Integrar validación presupuestal\n- Enviar RFQs automáticos\n- Generar OC automática\n- Ejecutar validación\n- Registrar bitácora y trazabilidad\n- Generar KPIs", etapa: "2. Validación SC\n3. Flujo de aprobación\n5. Cotización\n7. Generación OC\n9. Validación factura\n11. Analítica" },
            { rol: "Finanzas", resp: "Asignar y controlar el presupuesto", act: "- Validar disponibilidad presupuestal\n- Asignar partida / centro de costo\n- Autorizar uso de presupuesto\n- Monitorear consumo vs presupuesto", etapa: "3. Validación presupuestal" },
            { rol: "Aprobador (Gerente / Dirección)", resp: "Autorizar solicitudes de compra", act: "- Revisar solicitud de compra-\n- Aprobar / rechazar / solicitar ajustes\n- Validar alineación operativa", etapa: "4. Aprobación de SC" },
            { rol: "Compras", resp: "Administrar el gasto y gestionar proveedores", act: "- Gestionar cotizaciones (RFQ)\n- Analizar propuestas\n- Comparar condiciones (precio, tiempo, calidad)\n- Seleccionar proveedor\n- Justificar decisiones\n- Generar y validar OC\n- Asegurar optimización del gasto", etapa: "5. Cotización\n6. Selección de proveedor\n7. Generación de OC" },
            { rol: "Proveedor", resp: "Suministrar bienes o servicios", act: "- Recibir RFQ- Enviar cotización\n- Recibir OC\n- Entregar bienes/servicios\n- Enviar factura", etapa: "5. Cotización\n7. Recepción OC\n8. Entrega\n9. Facturación" },
            { rol: "Almacén / Operaciones", resp: "Validar recepción de bienes o ejecución de servicios", act: "- Recibir productos/servicios\n- Validar contra OC (cantidad/calidad)\n- Registrar evidencia (firma, fotos, documentos)\n- Reportar incidencias o rechazos", etapa: "8. Recepción de bienes/servicios" },
            { rol: "Tesorería", resp: "Ejecutar pagos y gestionar flujo de efectivo", act: "- Programar pagos según condiciones\n- Ejecutar pagos a proveedores\n- Gestionar flujo de caja\n- Registrar ejecución de pago", etapa: "10. Ejecución de pago" },
            { rol: "Sistema BI / Analítica", resp: "Generar información para toma de decisiones", act: "- Medir KPIs del proceso\n- Evaluar desempeño de proveedores\n- Generar dashboards\n- Detectar desviaciones y oportunidades", etapa: "11. Evaluación y analítica" },
            { rol: "Auditoría / Control Interno (recomendado)", resp: "Supervisar cumplimiento y control del proceso", act: "- Validar trazabilidad\n- Auditar cumplimiento de políticas\n- Revisar excepciones (compras urgentes, proveedor único)\n- Asegurar separación de funciones", etapa: "Transversal (todo el proceso)" }
        ],
        riesgos: [
            { riesgo: "Compra sin necesidad real", causa: "Falta de validación del requerimiento", impacto: "Gasto innecesario", prob: "Baja", sev: "Media", control: "Justificación obligatoria en SC + aprobación", tipo: "Preventivo", etapa: "SC", resp: "Aprobador" },
            { riesgo: "Compra sin presupuesto", causa: "No validación financiera", impacto: "Sobregasto", prob: "Baja", sev: "Alta", control: "Validación presupuestal obligatoria", tipo: "Preventivo", etapa: "SC", resp: "Finanzas" },
            { riesgo: "Sobregasto no controlado", causa: "Exceso de compras acumuladas", impacto: "Desviación financiera", prob: "Media", sev: "Alta", control: "Control de presupuesto en tiempo real + alertas", tipo: "Preventivo", etapa: "SC", resp: "Finanzas" },
            { riesgo: "Aprobaciones indebidas", causa: "Falta de control en roles", impacto: "Fraude", prob: "Baja", sev: "Alta", control: "Workflow automatizado + jerarquías", tipo: "Preventivo", etapa: "Aprobación", resp: "Sistema" },
            { riesgo: "Falta de segregación de funciones", causa: "Mismo usuario controla todo", impacto: "Riesgo de fraude", prob: "Baja", sev: "Crítica", control: "Separación: Finanzas ≠ Compras ≠ Tesorería", tipo: "Preventivo", etapa: "Roles", resp: "Dirección" },
            { riesgo: "Selección de proveedor inadecuado", causa: "Falta de comparativa", impacto: "Sobreprecio / mala calidad", prob: "Media", sev: "Alta", control: "Mínimo 2 cotizaciones (RFQ)", tipo: "Preventivo", etapa: "Cotización", resp: "Compras" },
            { riesgo: "Favoritismo a proveedores", causa: "Falta de transparencia", impacto: "Corrupción", prob: "Baja", sev: "Crítica", control: "Justificación obligatoria de selección", tipo: "Detectivo", etapa: "Selección", resp: "Compras / Auditoría" },
            { riesgo: "Error en Orden de Compra", causa: "Datos incorrectos", impacto: "Retrasos / pagos erróneos", prob: "Media", sev: "Media", control: "Generación automática de OC", tipo: "Preventivo", etapa: "OC", resp: "Sistema" },
            { riesgo: "Recepción incorrecta", causa: "No validación contra OC", impacto: "Pérdida económica", prob: "Media", sev: "Alta", control: "Validación física vs OC + evidencia", tipo: "Preventivo", etapa: "Recepción", resp: "Almacén" },
            { riesgo: "Recepción no registrada", causa: "Omisión del proceso", impacto: "Falta de trazabilidad", prob: "Baja", sev: "Alta", control: "Registro obligatorio en sistema", tipo: "Preventivo", etapa: "Recepción", resp: "Sistema" },
            { riesgo: "Pago sin validación", causa: "Falta de control documental", impacto: "Fraude / pago indebido", prob: "Baja", sev: "Crítica", control: "Validación 3-way match", tipo: "Preventivo", etapa: "Factura", resp: "Sistema" },
            { riesgo: "Factura duplicada", causa: "Falta de control", impacto: "Pago duplicado", prob: "Baja", sev: "Alta", control: "Validación de folio único", tipo: "Preventivo", etapa: "Pago", resp: "Sistema / Tesorería" },
            { riesgo: "Pago fuera de condiciones", causa: "Mala programación", impacto: "Problemas de flujo de caja", prob: "Media", sev: "Alta", control: "Programación automática de pagos", tipo: "Preventivo", etapa: "Pago", resp: "Tesorería" },
            { riesgo: "Pagos incorrectos", causa: "Error humano", impacto: "Pérdida económica", prob: "Media", sev: "Alta", control: "Validación previa + controles de pago", tipo: "Detectivo", etapa: "Pago", resp: "Tesorería" },
            { riesgo: "Compras fuera del proceso", causa: "Falta de control", impacto: "Riesgo de fraude", prob: "Media", sev: "Alta", control: "KPI + auditoría de compras", tipo: "Detectivo", etapa: "Control", resp: "Auditoría" },
            { riesgo: "Exceso de compras urgentes", causa: "Mala planeación", impacto: "Costos elevados", prob: "Alta", sev: "Alta", control: "Alertas de compras urgentes", tipo: "Detectivo", etapa: "SC", resp: "Sistema" },
            { riesgo: "Falta de trazabilidad", causa: "Procesos manuales", impacto: "Problemas de auditoría", prob: "Baja", sev: "Alta", control: "Bitácora completa del proceso", tipo: "Preventivo", etapa: "General", resp: "Sistema" },
            { riesgo: "Incidencias no gestionadas", causa: "Falta de seguimiento", impacto: "Impacto operativo", prob: "Media", sev: "Alta", control: "Bitácora de incidencias + seguimiento", tipo: "Detectivo", etapa: "Incidencias", resp: "Compras" }
        ],
        diagrama: {
            url: "https://miro.com/app/board/uXjVHZpsIT4=/?share_link_id=696878227715",
            img: "img/image2.png",
            text: "Ver diagrama completo de Compras en Miro"
        }
    },
    almacen: {
        contexto: {
            icon: "📦",
            title: "Gestión de Almacén",
            objetivo: "Establecer un modelo estandarizado, digital y basado en datos para la gestión del almacén que garantice:<br>• Disponibilidad de materiales<br>• Trazabilidad del inventario (objetivo: 100%)<br>• Control operativo en tiempo real<br>• Alineación entre inventario físico y sistema",
            alcance: "El proceso de gestión de almacén abarca desde la planeación de inventarios hasta la mejora continua, incluyendo la organización del almacén, recepción de materiales, control de inventario, gestión de salidas y control operativo. Asimismo, contempla la detección de necesidades de abastecimiento, las cuales se formalizan mediante requisiciones que conectan con el proceso de Compras, garantizando trazabilidad, control en tiempo real y alineación entre el inventario físico y el sistema."
        },
        proceso: [
            { step: "1", title: "Planeación de Inventarios", actor: "Planeación / Operaciones", desc: "Se realiza una planeación mensual integrada con operaciones, utilizando datos históricos y variables del negocio.<br>• Áreas operativas definen necesidades mensuales<br>• Se realiza el análisis de consumo histórico por producto<br>• Clasificación de productos:<br>  o Críticos: deben mantenerse siempre en stock<br>  o Bajo demanda: se compran contra necesidad<br>• Se realiza evaluación de variables:<br>  o Precio<br>  o Rotación<br>  o Disponibilidad<br>  o Espacio en almacén<br>• Se establecen niveles de inventario:<br>  o Stock mínimo<br>  o Stock máximo<br>  o Punto de reorden", consid: "", res: "• Plan de abastecimiento<br>• Niveles de inventario" },
            { step: "2", title: "Organización del Almacén", actor: "Almacén", desc: "Se estructura el almacén de forma estandarizada para asegurar trazabilidad y control.<br>• Definir estructura de almacenes (tipos y jerarquía)<br>• Estandarizar ubicaciones:<br>  o Zona<br>  o Rack<br>  o Nivel<br>  o Posición<br>• Normalizar catálogo y SKU<br>• Asignar ubicación a cada producto<br>• Implementar identificación visual:<br>  o Etiquetas<br>  o Códigos<br>  o Fotografías", consid: "", res: "• Almacen estructurado y actualizado<br>• Catálogo estandarizado" },
            { step: "3", title: "Recepción de Materiales", actor: "Almacén", desc: "Proceso estructurado de ingreso de materiales con validación total.<br>• Recibir material contra Orden de Compra<br>• Valida:<br>  ▪ Cantidad<br>  ▪ Calidad<br>• Evaluar condición del material<br>  o Decisión:<br>    ▪ No cumple → rechazo / devolución<br>    ▪ Cumple → continuar<br>• Registrar entrada en sistema en tiempo real<br>• Generar evidencia (opcional)<br>• Asignar ubicación", consid: "", res: "• Inventario actualizado<br>• Registro de entrada" },
            { step: "4", title: "Control de Inventario", actor: "Almacén, Auditoría / Supervisión, Dirección / Sistema", desc: "Se mantiene control continuo del inventario asegurando su exactitud<br>• Monitoreo continuo<br>  o Consultar inventario en sistema<br>  o Validar niveles por producto<br>• Validación contra niveles definidos<br>  o Comparar contra:<br>    ▪ Stock mínimo<br>    ▪ Punto de reorden<br>  o Decisión: ¿Se requiere reabastecimiento?<br>    ▪ Condiciones:<br>      • Inventario < stock mínimo<br>      • Producto crítico sin disponibilidad<br>      • Proyección de consumo supera inventario<br>• Generación de requisición de compra (conexión con proceso de compras)<br>  o Actividades:<br>    ▪ Identificación producto(s) a reabastecer<br>    ▪ Definir cantidad sugerida<br>    ▪ Genera requisición en sistema<br>• Registrar:<br>  o Producto<br>  o Cantidad<br>  o Justificación<br>  o Fecha<br>  o Enviar requisición al área de Compras<br>• Integración con proceso de Compras<br>  o La requisición se convierte en entrada formal del proceso de Compras<br>• Control de inventario interno<br>  o Realizar conteos cíclicos<br>  o Identificar diferencias<br>  o Registrar ajustes con causa raíz<br>  o Actualizar sistema", consid: "", res: "o Requisiciones de compra<br>o Inventario actualizado<br>o Registro de ajustes" },
            { step: "5", title: "Control de Salidas", actor: "Almacén, Operaciones, Supervisión/Dirección", desc: "Gestión controlada de salidas de materiales con clasificación y trazabilidad.<br>• Se recibe solicitud de salida<br>• Se clasifica el tipo de salida:<br>  • Con autorización<br>  • Sin autorización<br>  • Contra cambio<br>• Se valida disponibilidad<br>• Autorizar salida (si aplica – Supervisión/Dirección)<br>• Preparación de pedido (picking estructurado)<br>• Registro en sistema antes de entrega<br>• Entrega del material", consid: "", res: "• Inventario actualizado<br>• Salida registrada" },
            { step: "6", title: "Control y Orden del Almacén", actor: "Almacén, Auditoría y Supervisión", desc: "Garantizar que el almacén físico y el sistema estén completamente alineados.<br>• Validación sistema vs inventario físico<br>• Implementación de orden y limpieza<br>• Identificación visual de productos y ubicaciones<br>• Supervisar cumplimiento (Supervisión)<br>• definir periodos de auditorías programadas (1 por mes)", consid: "", res: "• Almacén organizado<br>• Inventario alineado" },
            { step: "7", title: "Evaluación y Auditoría", actor: "Auditoría / Supervisión, Sistemas y Dirección", desc: "Se mide el desempeño del proceso mediante indicadores y auditorías.<br>• Se realizan auditorías periódicas programadas<br>• Medir indicadores (Sistemas)<br>• Analizar desviaciones (Dirección)<br>• Generación de reportes", consid: "", res: "• Reportes de auditoría<br>• Indicadores de desempeño (KPIs)" },
            { step: "8", title: "Retroalimentación y Mejora Continua", actor: "Dirección / Administración, Supervisión y Operaciones", desc: "Gestión formal de mejora del proceso basada en resultados.<br>• Revisión periódica de KPIs<br>• Realizar sesiones formales de retroalimentación<br>• Definición de acciones correctivas (Operaciones)<br>• Seguimiento y cierre (Supervisión)", consid: "", res: "• Plan de mejora<br>• Acciones implementadas" }
        ],
        subprocesos: [],
        reglas: [
            "Todo producto debe estar registrado en el sistema antes de ser gestionado en el almacén.",
            "Todo producto debe contar con un SKU único, estandarizado y no duplicado.",
            "Todo producto debe tener una ubicación asignada dentro del almacén.",
            "Todos los movimientos de inventario (entradas, salidas, ajustes) deben registrarse en tiempo real.",
            "Reglas de recepción:<ul style='margin:4px 0 4px 20px;'><li>No se permite la recepción sin una Orden de Compra válida.</li><li>Toda recepción debe validarse contra la OC en cantidad y especificación.</li><li>Todo material debe pasar validación de calidad. Los que no cumplan se rechazan.</li><li>Debe ubicarse inmediatamente.</li></ul>",
            "Reglas de inventario:<ul style='margin:4px 0 4px 20px;'><li>Monitoreo continuo mediante el sistema.</li><li>Conteos cíclicos periódicos conforme a programación.</li><li>Toda diferencia físico vs sistema se registra con causa raíz.</li><li>No se permiten ajustes sin justificación.</li></ul>"
        ],
        kpis: [
            { cat: "Inventario", nombre: "Exactitud de inventario (%)", formula: "(Inventario correcto / Inventario total) × 100", interpretacion: "Mide la confiabilidad del inventario. Un valor cercano a 100% indica control total." },
            { cat: "Inventario", nombre: "Nivel de trazabilidad (%)", formula: "(Movimientos registrados / Movimientos totales) × 100", interpretacion: "100% = trazabilidad total." },
            { cat: "Inventario", nombre: "Diferencias inventario físico vs sistema", formula: "Inventario físico – Inventario sistema", interpretacion: "Debe tender a 0." },
            { cat: "Recepción", nombre: "Tiempo de recepción", formula: "Hora registro – Hora recepción", interpretacion: "Evalúa eficiencia. Ideal: en tiempo real." },
            { cat: "Servicio", nombre: "Tiempo de atención", formula: "Hora inicio atención – Hora solicitud", interpretacion: "Menor tiempo = mayor eficiencia." },
            { cat: "Servicio", nombre: "Número de salidas por día", formula: "Total de salidas en el día", interpretacion: "Mide la carga operativa." },
            { cat: "Servicio", nombre: "Nivel de cumplimiento de pedidos (%)", formula: "(Pedidos cumplidos / Pedidos totales) × 100", interpretacion: "Mide el nivel de servicio." },
            { cat: "Control", nombre: "% de movimientos registrados en tiempo real", formula: "(Movimientos en tiempo real / Movimientos totales) × 100", interpretacion: "Objetivo: 100%." },
            { cat: "Calidad", nombre: "% de incidencias general", formula: "(Incidencias totales / Movimientos totales) × 100", interpretacion: "Fallas operativas. Debe ser bajo." },
            { cat: "Calidad", nombre: "% de recepciones con incidencias", formula: "(Recepciones con error / Recepciones totales) × 100", interpretacion: "Evalúa calidad del proveedor." },
            { cat: "Calidad", nombre: "Tiempo de validación en recepción", formula: "Hora validación – Hora recepción", interpretacion: "Eficiencia del control de calidad." },
            { cat: "5S", nombre: "Nivel de cumplimiento (%) (Orden y control)", formula: "(Puntos cumplidos / Puntos evaluados) × 100", interpretacion: "Evalúa disciplina operativa." },
            { cat: "Sistema", nombre: "Alineación sistema vs inventario físico (%)", formula: "(Productos correctos / Productos revisados) × 100", interpretacion: "Mide control general. Ideal: ≥ 98%." }
        ],
        roles: [
            { rol: "Planeación / Operaciones", resp: "Definir la demanda y necesidades de inventario alineadas a la operación", act: "- Proyectar demanda mensual\n- Analizar consumo histórico\n- Clasificar productos (críticos / bajo demanda)\n- Definir niveles de inventario", etapa: "Planeación de inventarios" },
            { rol: "Compras", resp: "Abastecer materiales conforme a la planeación", act: "- Generar órdenes de compra\n- Coordinar entregas con proveedores\n- Asegurar disponibilidad de materiales", etapa: "Planeación / Recepción" },
            { rol: "Almacén", resp: "Gestionar el control operativo del inventario físico y digital", act: "- Recepción de materiales\n- Registro de entradas y salidas en sistema\n- Asignación de ubicaciones\n- Preparación de pedidos (picking)\n- Control de inventario\n- Ejecución de conteos cíclicos", etapa: "Organización / Recepción / Inventario / Salidas / Control" },
            { rol: "Calidad", resp: "Validar que los materiales cumplan con los estándares requeridos", act: "- Inspección de calidad en recepción\n- Validación de condiciones del producto\n- Aprobación o rechazo de materiales", etapa: "Recepción" },
            { rol: "Auditoría / Supervisión", resp: "Asegurar cumplimiento del proceso y exactitud del inventario", act: "- Auditorías periódicas\n- Validación físico vs sistema\n- Identificación de desviaciones\n- Seguimiento a diferencias", etapa: "Evaluación / Control" },
            { rol: "Dirección / Administración", resp: "Dar seguimiento estratégico al desempeño del almacén", act: "- Revisión de KPIs\n- Toma de decisiones estratégicas\n- Priorización de acciones de mejora", etapa: "Evaluación / Retroalimentación" }
        ],
        riesgos: [
            { riesgo: "Planeación incorrecta de inventarios", causa: "Falta o exceso de stock", impacto: "Alto", prob: "Media", sev: "Alta", control: "Planeación basada en históricos + validación con operaciones", tipo: "Preventivo", etapa: "Planeación", resp: "Planeación" },
            { riesgo: "No clasificación de productos", causa: "Desabasto de productos críticos", impacto: "Alto", prob: "Media", sev: "Alta", control: "Clasificación obligatoria de productos", tipo: "Preventivo", etapa: "Planeación", resp: "Planeación" },
            { riesgo: "Ubicaciones no estandarizadas", causa: "Pérdida de trazabilidad", impacto: "Alto", prob: "Alta", sev: "Alta", control: "Estructura definida de ubicaciones (zona, rack, nivel)", tipo: "Preventivo", etapa: "Organización", resp: "Almacén" },
            { riesgo: "SKU duplicados o mal definidos", causa: "Errores en inventario", impacto: "Alto", prob: "Media", sev: "Alta", control: "Catálogo centralizado y validado", tipo: "Preventivo", etapa: "Organización", resp: "Sistemas / Almacén" },
            { riesgo: "Recepción sin orden de compra", causa: "Ingreso no controlado de material", impacto: "Alto", prob: "Baja", sev: "Alta", control: "Bloqueo de recepción sin OC", tipo: "Preventivo", etapa: "Recepción", resp: "Almacén" },
            { riesgo: "Error en validación de cantidad o calidad", causa: "Inventario incorrecto", impacto: "Alto", prob: "Media", sev: "Alta", control: "Validación obligatoria + control de calidad", tipo: "Preventivo", etapa: "Recepción", resp: "Almacén / Calidad" },
            { riesgo: "Registro tardío de entradas", causa: "Desfase sistema vs físico", impacto: "Alto", prob: "Alta", sev: "Alta", control: "Registro en tiempo real obligatorio", tipo: "Preventivo", etapa: "Recepción", resp: "Almacén" },
            { riesgo: "Diferencias físico vs sistema", causa: "Pérdidas y descontrol", impacto: "Alto", prob: "Alta", sev: "Alta", control: "Conteos cíclicos periódicos", tipo: "Detectivo", etapa: "Inventario", resp: "Almacén" },
            { riesgo: "Ajustes sin justificación", causa: "Riesgo de fraude o error", impacto: "Alto", prob: "Media", sev: "Alta", control: "Registro obligatorio de causa raíz", tipo: "Detectivo", etapa: "Inventario", resp: "Almacén / Auditoría" },
            { riesgo: "No generación de requisiciones", causa: "Falta de abastecimiento", impacto: "Alto", prob: "Media", sev: "Alta", control: "Requisición obligatoria al detectar necesidad", tipo: "Preventivo", etapa: "Inventario", resp: "Almacén" },
            { riesgo: "Entrega sin registro", causa: "Pérdida de control", impacto: "Alto", prob: "Alta", sev: "Alta", control: "Bloqueo de salida sin registro previo", tipo: "Preventivo", etapa: "Salidas", resp: "Almacén" }
        ],
        diagrama: {
            url: "#",
            img: "img/image3.png",
            text: "Ver diagrama completo de Almacén"
        }
    },
    mantenimiento: {
        contexto: {
            icon: "🔧",
            title: "Gestión de Mantenimiento",
            objetivo: "Asegurar la disponibilidad, confiabilidad y seguridad de los activos (unidades, planta e instalaciones) mediante un sistema estructurado de mantenimiento preventivo y correctivo, basado en criterios técnicos, trazabilidad completa y control operativo en tiempo real.",
            alcance: "El proceso de gestión de mantenimiento abarca la planeación, ejecución, control y seguimiento de los mantenimientos preventivos y correctivos de las unidades de recolección, desde la detección de eventos hasta su cierre y análisis. Incluye la inspección pre-operativa, el registro y clasificación de fallas bajo criterios técnicos, la programación con base en ventanas de mantenimiento, la ejecución de trabajos, su validación y la generación de indicadores para mejora continua, asegurando la disponibilidad, seguridad y confiabilidad de las unidades."
        },
        proceso: [
            { step: "1", title: "Detección del evento", actor: "Operador, Sistema, Técnico, Encargado de mantenimiento", desc: "• El operador ejecuta checklist pre-operativo\n  1.2 Verifica condiciones:\n  • Fugas\n  • Presión\n  • Estado de mangueras\n  • Sistema de bombeo\n  • Frenos / llantas\n• El sistema evalúa:\n  • Km vs límite preventivo\n  • Horas vs límite preventivo\n• El operador detecta anomalías durante operación (si aplica)\n• Se identifica:\n  • Falla\n  • Condición de riesgo\n  • Necesidad de mantenimiento preventivo\n\nDecisión:\n¿Existe anomalía o mantenimiento requerido?\n• NO → Continúa operación\n• SÍ → pasa a registro", consid: "", res: "• Evento identificado" },
            { step: "2", title: "Registro del evento", actor: "Operador / Técnico, Auxiliar administrativo, Sistema", desc: "• Se captura el evento en sistema (Herramienta digital)\n• Se registra:\n  • ID de unidad\n  • Tipo de evento (preventivo / correctivo)\n  • Sistema afectado\n  • Descripción detallada\n  • Fecha y hora\n  • Usuario\n• Se capturan evidencias:\n  • Fotografías\n  • Videos\n  • Resultado de checklist\n• Se registran medidores:\n  • Km (odómetro)\n  • Horas (horómetro)\n• El sistema valida:\n  • Campos obligatorios\n  • Evidencia\n• Se genera folio automático", consid: "Reglas que se deben de respetar:\n• Evento sin registro → no existe\n• Evento sin evidencia → no avanza\n• Uso de formatos homologados obligatorio", res: "• Evento registrado y trazable" },
            { step: "3", title: "Clasificación de la falla", actor: "Encargado de mantenimiento, Técnico", desc: "• Evaluar condición de seguridad:\n  • ¿Existe riesgo inmediato?\n• Evaluar cumplimiento legal:\n  • ¿Incumple norma?\n• Evaluar capacidad técnica:\n  • ¿Se puede diagnosticar?\n• Clasificar urgencia:\n  • Crítico → detiene operación\n  • Alto → atención prioritaria\n  • Bajo → programable\n• Estimar rango de costo:\n  • A / B / C / D\n\nResultado (Asignación de estado):\n• Disponible\n• Disponible con restricción\n• En mantenimiento\n• Fuera de servicio", consid: "Reglas que se deben de respetar:\n• Seguridad → detención inmediata\n• Legal → no operar\n• Sin certeza técnica → escalar", res: "• Evento clasificado + estatus" },
            { step: "4", title: "Toma de decisión", actor: "Encargado de mantenimiento, Dirección, Finanzas", desc: "• Evaluar criterios de decisión\n  4.2 Definir acción:\n  • Ejecutar inmediato\n  • Programar mantenimiento\n  • Escalar\n  • Permitir operación restringida", consid: "Reglas que se deben de respetar:\n• Preventivo → obligatorio\n• Riesgo → no operar\n• Costos altos → aprobación", res: "• Acción definida" },
            { step: "5", title: "Programación", actor: "Encargado de mantenimiento, Coordinador de operaciones", desc: "• 5.1 Definir fecha de mantenimiento\n• 5.2 Validar disponibilidad de unidad\n• 5.3 Coordinar salida de operación\n• 5.4 Asignar técnico o proveedor\n• 5.5 Generar orden de mantenimiento\n\nGestión de ventanas de mantenimiento:\nSupuesto:\n * Mantenimiento preventivo cada 10,000 km", consid: "Regla crítica:\n• Fuera de tolerancia → detención automática", res: "• Orden programada" },
            { step: "6", title: "Ejecución del mantenimiento", actor: "Técnico, Proveedor, Encargado", desc: "• 6.1 Recepción de orden\n• 6.2 Diagnóstico técnico\n• 6.3 Ejecución de mantenimiento:\n  • Reparación\n  • Ajuste\n  • Reemplazo\n• Registro en sistema:\n  • Actividades\n  • Refacciones\n  • Tiempo\n• 6.5 Captura de evidencia", consid: "Reglas que se deben de respetar:\n• Todo se registra\n• Evidencia obligatoria", res: "• Mantenimiento ejecutado" },
            { step: "7", title: "Validación", actor: "Encargado de mantenimiento", desc: "• Verificar ejecución\n• Validar seguridad\n• Validar operatividad\n• Revisar evidencia\n• Pruebas funcionales", consid: "Regla que se debe de considerar:\n• No se puede cerrar sin validación", res: "• Evento validado" },
            { step: "8", title: "Cierre", actor: "Auxiliar, Encargado", desc: "• Registrar:\n  • Acción realizada\n  • Costo real\n  • Observaciones\n• Actualizar estatus:\n  • Disponible / restricción\n• Cerrar evento en sistema", consid: "", res: "• Evento cerrado" },
            { step: "9", title: "Reporte de mejora continua", actor: "Encargado, Dirección", desc: "• Generar KPIs\n• Analizar fallas recurrentes\n• Realizar análisis causa raíz\n• Ajustar rutinas preventivas", consid: "", res: "• Mejora del sistema" }
        ],
        subprocesos: [],
        reglas: [
            "Generales<br>• Todo evento de mantenimiento debe ser registrado en el sistema con información mínima obligatoria.<br>  - Evento no registrado se considera inexistente.<br>• Todo evento debe contar con evidencia (fotográfica, checklist o documental) para poder avanzar en el flujo.<br>• Las decisiones del proceso deben basarse en criterios definidos (seguridad, legal, técnico, urgencia, costo), no en juicio personal.<br>• El sistema debe garantizar trazabilidad completa de cada evento desde su detección hasta su cierre.<br>• No se permite la ejecución de mantenimiento sin una orden de mantenimiento previamente generada.",
            "Seguridad y cumplimmiento<br>• Ninguna unidad puede operar si representa riesgo para la seguridad de personas o activos.<br>• Ninguna unidad puede operar si incumple requisitos legales o normativos aplicables.<br>• Si una falla compromete seguridad o cumplimiento legal, la unidad debe cambiar automáticamente a estatus:<br>  - Fuera de servicio<br>• Los criterios de seguridad y cumplimiento legal prevalecen sobre cualquier consideración operativa o económica."
        ],
        kpis: [
            { cat: "Disponibilidad", nombre: "Disponibilidad de unidades (%)", formula: "(Unidades disponibles / Total) × 100", interpretacion: "Qué porcentaje de unidades está listo para operar" },
            { cat: "Disponibilidad", nombre: "% unidades fuera de servicio", formula: "(Fuera de servicio / Total) × 100", interpretacion: "Cuántas unidades están detenidas" },
            { cat: "Eficiencia", nombre: "Tiempo de respuesta", formula: "Hora atención - hora registro", interpretacion: "Qué tan rápido reaccionas ante fallas" },
            { cat: "Eficiencia", nombre: "Tiempo de ejecución", formula: "Hora fin - hora inicio", interpretacion: "Qué tan rápido se resuelve el mantenimiento" },
            { cat: "Eficiencia", nombre: "Órdenes atendidas vs generadas (%)", formula: "(Atendidas / Generadas) × 100", interpretacion: "Nivel de cumplimiento operativo" },
            { cat: "Preventivo", nombre: "% cumplimiento de preventivos", formula: "(Preventivos realizados / programados) × 100", interpretacion: "Disciplina en mantenimiento preventivo" },
            { cat: "Preventivo", nombre: "% cumplimiento de ventanas", formula: "(Preventivos en ventana / total) × 100", interpretacion: "Si el mantenimiento se hace a tiempo" },
            { cat: "Preventivo", nombre: "% preventivo vs correctivo", formula: "(Preventivos / total eventos) × 100", interpretacion: "Nivel de madurez del sistema (ideal 80/20)" },
            { cat: "Fallas", nombre: "Fallas en ruta", formula: "Conteo mensual", interpretacion: "Nivel de confiabilidad en operación" },
            { cat: "Fallas", nombre: "Fallas recurrentes", formula: "Conteo de repetición", interpretacion: "Problemas no resueltos de raíz" },
            { cat: "Costos", nombre: "Costo total de mantenimiento", formula: "Suma de costos", interpretacion: "Gasto total en mantenimiento" },
            { cat: "Costos", nombre: "Costo por unidad", formula: "Costo total / unidades", interpretacion: "Eficiencia por unidad" },
            { cat: "Costos", nombre: "Costo preventivo vs correctivo", formula: "Comparativo", interpretacion: "Si el sistema es reactivo o preventivo" },
            { cat: "Control", nombre: "% eventos registrados", formula: "(Registrados / detectados) × 100", interpretacion: "Nivel de control del proceso" }
        ],
        roles: [
            { rol: "Operador / Chofer", resp: "Ejecutor en campo y primer punto de detección", act: "- Ejecutar checklist pre-operativo\n- Identificar fugas o anomalías\n- Reportar eventos y evidencias\n- Detener operación si aplica", etapa: "1. Detección\n2. Registro" },
            { rol: "Técnico de mantenimiento", resp: "Ejecutor técnico de mantenimiento", act: "- Ejecutar preventivos y correctivos\n- Diagnosticar fallas\n- Registrar refacciones y tiempos\n- Capturar evidencia técnica", etapa: "6. Ejecución\n3 y 7 como soporte" },
            { rol: "Encargado de mantenimiento", resp: "Responsable del control operativo y toma de decisiones", act: "- Clasificar eventos (RCM)\n- Definir estatus y acciones\n- Programar y supervisar\n- Validar operatividad y seguridad\n- Autorizar cierre y analizar KPIs", etapa: "3, 4, 5, 6, 7, 8, 9" },
            { rol: "Auxiliar administrativo", resp: "Soporte administrativo y control documental", act: "- Registrar eventos\n- Validar información y evidencias\n- Dar seguimiento a órdenes\n- Registrar costos y cierres", etapa: "2. Registro\n8. Cierre" },
            { rol: "Coordinador de operaciones", resp: "Gestión de disponibilidad operativa", act: "- Coordinar operación vs mantenimiento\n- Coordinar salida de unidades a taller\n- Reprogramar rutas y priorizar críticas", etapa: "5. Programación" },
            { rol: "Finanzas / Tesorería", resp: "Control y autorización financiera", act: "- Validar costos\n- Autorizar gastos fuera de rango\n- Registrar impacto financiero", etapa: "4. Decisión" },
            { rol: "Dirección / Gerencia", resp: "Supervisión estratégica", act: "- Tomar decisiones estratégicas y críticas\n- Supervisar desempeño y KPIs\n- Definir mejoras", etapa: "4. Decisión\n9. Reporte" },
            { rol: "Sistema (Soft Flot)", resp: "Soporte tecnológico y automatización", act: "- Generar alertas automáticas y folios\n- Validar reglas y campos\n- Bloquear unidades automáticamente\n- Generar reportes", etapa: "1, 2, 5, 6, 8, 9" }
        ],
        riesgos: [
            { riesgo: "Operación de unidad en condiciones inseguras", causa: "No se realiza inspección", impacto: "Accidentes, daño a activos", prob: "Alta", sev: "Crítica", control: "Inspección obligatoria + bloqueo", tipo: "Preventivo", etapa: "Detección", resp: "Operador / Sistema" },
            { riesgo: "Falta de registro de eventos", causa: "Omisión del usuario", impacto: "Pérdida de trazabilidad", prob: "Media", sev: "Alta", control: "Registro obligatorio + validación", tipo: "Preventivo / Detectivo", etapa: "Registro", resp: "Sistema / Auxiliar" },
            { riesgo: "Eventos sin evidencia", causa: "Falta de disciplina", impacto: "Decisiones incorrectas", prob: "Media", sev: "Alta", control: "Evidencia obligatoria para avanzar", tipo: "Preventivo", etapa: "Registro", resp: "Sistema / Técnico" },
            { riesgo: "Clasificación incorrecta de fallas", causa: "Falta de criterio técnico", impacto: "Riesgo operativo", prob: "Media", sev: "Alta", control: "Uso de criterios RCM", tipo: "Preventivo", etapa: "Clasificación", resp: "Encargado" },
            { riesgo: "No ejecución de mantenimiento preventivo", causa: "Mala planificación", impacto: "Costos y fallas", prob: "Alta", sev: "Crítica", control: "Control por ventanas + bloqueo automático", tipo: "Preventivo", etapa: "Programación", resp: "Sistema / Encargado" },
            { riesgo: "Fallas recurrentes no atendidas", causa: "No se analiza causa raíz", impacto: "Aumento de costos", prob: "Media", sev: "Alta", control: "Análisis de causa raíz + ajuste preventivo", tipo: "Correctivo", etapa: "Reporte", resp: "Encargado" },
            { riesgo: "Baja disponibilidad de unidades", causa: "Mala gestión de mantenimiento", impacto: "Incumplimiento operativo", prob: "Alta", sev: "Crítica", control: "KPI de disponibilidad + programación", tipo: "Preventivo", etapa: "Programación", resp: "Operaciones" },
            { riesgo: "Cierre de eventos sin validación", causa: "Omisión del proceso", impacto: "Pérdida de calidad", prob: "Media", sev: "Alta", control: "Regla de no cierre sin validación en sistema", tipo: "Preventivo", etapa: "Cierre", resp: "Sistema" }
        ],
        diagrama: {
            url: "#",
            img: "img/image5.png",
            text: "Ver diagrama completo de Mantenimiento"
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
                        
                        <div class="alert-box" style="border-left-color: #E03131; background-color: #FFF5F5;">
                            <div class="alert-title" style="color: #E03131;">
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
