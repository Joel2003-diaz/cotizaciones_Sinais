const GOOGLE_SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUÍ';
const { jsPDF } = window.jspdf;

// Ruta del logo - AJUSTA ESTA RUTA SEGÚN TU ARCHIVO
const LOGO_PATH = 'logo.jpg';

document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const form = document.getElementById('cotizacionForm');
    const vaciarBtn = document.getElementById('vaciarFormulario');
    const previsualizarBtn = document.getElementById('previsualizarBtn');
    const guardarImprimirBtn = document.getElementById('guardarImprimirBtn');
    const imprimirBtn = document.getElementById('imprimirBtn');
    const descargarPdfBtn = document.getElementById('descargarPdfBtn');
    const imprimirPreviewBtn = document.getElementById('imprimirPreviewBtn');
    const responseDiv = document.getElementById('responseMessage');
    const previewDiv = document.getElementById('cotizacionPreview');

    // Configurar fecha actual
    const today = new Date();
    document.getElementById('FECHA_COTIZACION').value = today.toISOString().split('T')[0];

    // Valores por defecto
    document.getElementById('PORCENTAJE_DESCUENTO').value = '0';
    document.getElementById('TIPO_DOCUMENTO').value = 'CC';
    document.getElementById('SEXO').value = 'M';

    // Event listeners
    vaciarBtn.addEventListener('click', vaciarFormulario);
    previsualizarBtn.addEventListener('click', previsualizarCotizacion);
    guardarImprimirBtn.addEventListener('click', guardarYCrearPDF);
    imprimirBtn.addEventListener('click', imprimirCotizacion);
    descargarPdfBtn.addEventListener('click', generarPDF);
    imprimirPreviewBtn.addEventListener('click', imprimirCotizacion);

    // Validación en tiempo real
    form.addEventListener('input', function() {
        const valido = form.checkValidity();
        if (valido) {
            generarVistaPrevia();
            habilitarBotones(true);
        } else {
            habilitarBotones(false);
        }
    });

    // Función para vaciar formulario
    function vaciarFormulario() {
        if (confirm('¿Está seguro de que desea vaciar todo el formulario?')) {
            form.reset();
            document.getElementById('FECHA_COTIZACION').value = today.toISOString().split('T')[0];
            document.getElementById('PORCENTAJE_DESCUENTO').value = '0';
            document.getElementById('TIPO_DOCUMENTO').value = 'CC';
            document.getElementById('SEXO').value = 'M';
            
            resetearVistaPrevia();
            mostrarMensaje('info', '📝 Formulario listo para nueva cotización');
        }
    }

    // Función para previsualizar
    function previsualizarCotizacion() {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        generarVistaPrevia();
        habilitarBotones(true);
        mostrarMensaje('success', '✅ Vista previa generada correctamente');
    }

    // Función para habilitar/deshabilitar botones
    function habilitarBotones(habilitar) {
        imprimirBtn.disabled = !habilitar;
        descargarPdfBtn.disabled = !habilitar;
        imprimirPreviewBtn.disabled = !habilitar;
    }

    // Función para resetear vista previa
    function resetearVistaPrevia() {
        previewDiv.innerHTML = `
            <div class="preview-placeholder">
                <div class="placeholder-content">
                    <div class="placeholder-icon">📋</div>
                    <h3>Vista Previa de Cotización</h3>
                    <p>Complete los campos obligatorios (*)</p>
                    <p>y haga clic en "Previsualizar"</p>
                    <small>Los datos marcados con * se guardarán en Google Sheets</small>
                </div>
            </div>
        `;
        habilitarBotones(false);
    }

    // Función para generar vista previa con diseño EXACTO
// Función para generar vista previa con diseño EXACTO - VERSIÓN CORREGIDA
function generarVistaPrevia() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const valor = Number(data.VALOR) || 0;
    const porc = Number(data.PORCENTAJE_DESCUENTO) || 0;
    const desc = valor * (porc / 100);
    const total = valor - desc;

    const moneda = v =>
        new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(v);

    const fecha = new Date(data.FECHA_COTIZACION).toLocaleDateString('es-CO');

    const html = `
<div id="pdfContent" style="
    width:210mm;
    min-height:297mm;
    padding:20mm;
    box-sizing:border-box;
    font-family:Arial, sans-serif;
    font-size:9pt;
    color:#000;
">

<!-- ================= CABECERA ================= -->
<table style="
    width:100%;
    border-collapse:collapse;
    border:1px solid #000;
    table-layout:fixed;
">
<tr style="height:30mm;"> <!-- Ajusté la altura -->

<!-- LOGO - COLUMNA IZQUIERDA -->
<td style="
    width:22%;
    border:1px solid #000;
    text-align:center;
    vertical-align:middle;
    padding:0;
">
    <div style="
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:1mm;
    ">
        <img src="${LOGO_PATH}" style="
            max-height:25mm;   /* Ajuste para mantener proporción */
            max-width:100%;
            object-fit:contain;
        " onerror="this.style.display='none'">
    </div>
</td>

<!-- TEXTO CENTRAL -->
<td style="
    width:58%;
    border:1px solid #000;
    text-align:center;
    font-size:9pt;
    padding:3mm;
    vertical-align:middle;
    line-height:1.4;
">
    <b style="font-size:11pt; display:block; margin-bottom:2mm;">COTIZACIONES</b>
    CLINICA REGIONAL DE ESPECIALISTAS SINAIS VITAIS S.A.S<br>
    NIT. 900498069-1<br>
    CALLE 18 # 16 - 09 BOSCONIA CESAR<br>
    Teléfono: 5781068
</td>

<!-- DATOS DERECHA -->
<td style="
    width:20%;  /* Ajusté de 22% a 20% para mejor balance */
    border:1px solid #000;
    font-size:8pt;
    padding:3mm;
    vertical-align:middle;
    line-height:1.4;
">
    <b>Código:</b><br>
    <b>Versión:</b><br>
    <b>Fecha:</b> ${fecha}<br>
    <b>Página:</b> 1 de 1
</td>
</tr>
</table>

<!-- ================= FECHA Y NÚMERO ================= -->
<div style="text-align:center; margin:6mm 0; font-weight:bold;">
Fecha de Cotización: ${fecha} &nbsp;&nbsp; | &nbsp;&nbsp; N° Cotización: ${data.N_CONSECUTIVO}
</div>

<hr style="border:none; border-top:1px solid #000; margin-bottom:6mm;">

<!-- ================= DATOS DEL PACIENTE ================= -->
<table style="width:100%; font-size:9pt; margin-bottom:6mm; border-collapse:collapse;">
<tr>
<td style="padding:1mm 0;"><b>Señores:</b> ${data.EMPRESA || ''}</td>
<td style="padding:1mm 0;"><b>Admisión:</b> ${data.ADMISION || ''}</td>
</tr>
<tr>
<td style="padding:1mm 0;"><b>Paciente:</b> ${data.NOMBRES || ''}</td>
<td style="padding:1mm 0;"><b>CC:</b> ${data.DOCUMENTO || ''} &nbsp; <b>TD:</b> ${data.TIPO_DOCUMENTO || ''} &nbsp; <b>Sexo:</b> ${data.SEXO || ''}</td>
</tr>
<tr>
<td style="padding:1mm 0;"><b>Dirección:</b> ${data.DIRECCION || ''}</td>
<td style="padding:1mm 0;"><b>Depto:</b> ${data.DEPARTAMENTO || ''} &nbsp; <b>Ciudad:</b> ${data.CIUDAD || ''}</td>
</tr>
<tr>
<td style="padding:1mm 0;"><b>Teléfono:</b> ${data.TELEFONO || ''}</td>
<td style="padding:1mm 0;"></td>
</tr>
</table>

<!-- ================= TABLA SERVICIOS ================= -->
<table style="width:100%; border-collapse:collapse; font-size:9pt; margin-bottom:6mm;">
<thead>
<tr style="background:#d9d9d9;">
<th style="border:1px solid #000; padding:2mm;">Cups</th>
<th style="border:1px solid #000; padding:2mm;">Descripción</th>
<th style="border:1px solid #000; padding:2mm;">Cantidad</th>
<th style="border:1px solid #000; padding:2mm;">Vr. Unitario</th>
<th style="border:1px solid #000; padding:2mm;">Vr. Desc</th>
<th style="border:1px solid #000; padding:2mm;">% Desc</th>
<th style="border:1px solid #000; padding:2mm;">Vr. Total</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border:1px solid #000; text-align:center; padding:2mm;">${data.CODIGO_CUPS || ''}</td>
<td style="border:1px solid #000; padding:2mm;">${data.SERVICIO_COTIZADO || ''}</td>
<td style="border:1px solid #000; text-align:center; padding:2mm;">1</td>
<td style="border:1px solid #000; text-align:right; padding:2mm;">$ ${moneda(valor)}</td>
<td style="border:1px solid #000; text-align:right; padding:2mm;">$ ${moneda(desc)}</td>
<td style="border:1px solid #000; text-align:center; padding:2mm;">${porc}%</td>
<td style="border:1px solid #000; text-align:right; padding:2mm;">$ ${moneda(total)}</td>
</tr>
</tbody>
</table>

<!-- ================= OBSERVACIÓN ================= -->
<div style="margin-top:6mm; margin-bottom:8mm;">
<b>Observación</b><br>
<div style="border:1px solid #000; padding:3mm; min-height:20mm; margin-top:1mm;">
${data.OBSERVACION || ''}
</div>
</div>

<hr style="border:none; border-top:1px solid #000; margin:8mm 0;">

<!-- ================= TOTALES ================= -->
<table style="width:100%; font-size:9pt;">
<tr><td style="text-align:right; padding:1mm;">Subtotal: $ ${moneda(valor)}</td></tr>
<tr><td style="text-align:right; padding:1mm;">Descuento: $ ${moneda(desc)}</td></tr>
<tr><td style="text-align:right; font-size:11pt; padding:2mm 0;"><b>Total: $ ${moneda(total)}</b></td></tr>
</table>

</div>
`;

    previewDiv.innerHTML = html;
}
    // Función para guardar y crear PDF
    async function guardarYCrearPDF() {
        mostrarMensaje('info', '⏳ Procesando...');
        
        try {
            // Guardar en Google Sheets
            const guardado = await guardarEnGoogleSheets();
            
            if (guardado) {
                // Generar PDF
                await generarPDF();
                mostrarMensaje('success', '✅ Datos guardados en Google Sheets y PDF generado');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('error', '❌ Error: ' + error.message);
        }
    }

    // Función para guardar SOLO LOS DATOS ESPECÍFICOS en Google Sheets
    async function guardarEnGoogleSheets() {
        const datosParaEnviar = {
            N_CONSECUTIVO: document.getElementById('N_CONSECUTIVO').value,
            FECHA_COTIZACION: document.getElementById('FECHA_COTIZACION').value,
            TIPO_DOCUMENTO: document.getElementById('TIPO_DOCUMENTO').value,
            DOCUMENTO: document.getElementById('DOCUMENTO').value,
            NOMBRES: document.getElementById('NOMBRES').value,
            EMPRESA: document.getElementById('EMPRESA').value,
            ESPECIALIDAD: document.getElementById('ESPECIALIDAD').value,
            CODIGO_CUPS: document.getElementById('CODIGO_CUPS').value,
            SERVICIO_COTIZADO: document.getElementById('SERVICIO_COTIZADO').value,
            VALOR: document.getElementById('VALOR').value,
            PORCENTAJE_DESCUENTO: document.getElementById('PORCENTAJE_DESCUENTO').value,
            OBSERVACION: document.getElementById('OBSERVACION').value,
            FECHA_REGISTRO: new Date().toISOString()
        };

        try {
            const params = new URLSearchParams();
            Object.keys(datosParaEnviar).forEach(key => {
                params.append(key, datosParaEnviar[key]);
            });

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });

            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return true;
            
        } catch (error) {
            throw new Error('No se pudo guardar en Google Sheets: ' + error.message);
        }
    }

    // Función OPTIMIZADA para generar PDF EXACTO
    async function generarPDF() {
        try {
            mostrarMensaje('info', '⏳ Generando PDF...');
            
            // Crear elemento temporal con dimensiones EXACTAS para A4
            const tempDiv = document.createElement('div');
            tempDiv.style.width = '794px';
            tempDiv.style.minHeight = '1123px';
            tempDiv.style.padding = '56px';
            tempDiv.style.margin = '0';
            tempDiv.style.background = 'white';
            tempDiv.style.position = 'fixed';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '0';
            tempDiv.style.fontFamily = 'Arial, sans-serif';
            tempDiv.style.fontSize = '11pt';
            tempDiv.style.lineHeight = '1.3';
            tempDiv.style.boxSizing = 'border-box';
            
            // Copiar contenido exacto
            tempDiv.innerHTML = previewDiv.innerHTML;
            document.body.appendChild(tempDiv);
            
            // Esperar a que las imágenes se carguen
            await new Promise(resolve => {
                const images = tempDiv.getElementsByTagName('img');
                if (images.length === 0) {
                    resolve();
                    return;
                }
                
                let loadedCount = 0;
                Array.from(images).forEach(img => {
                    if (img.complete) {
                        loadedCount++;
                    } else {
                        img.onload = () => {
                            loadedCount++;
                            if (loadedCount === images.length) resolve();
                        };
                        img.onerror = () => {
                            loadedCount++;
                            if (loadedCount === images.length) resolve();
                        };
                    }
                });
                
                if (loadedCount === images.length) resolve();
            });
            
            // Configurar html2canvas con dimensiones FIJAS
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: 794,
                height: 1123,
                windowWidth: 794,
                windowHeight: 1123
            });
            
            // Remover elemento temporal
            document.body.removeChild(tempDiv);
            
            // Crear PDF con tamaño exacto A4
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
                precision: 100
            });
            
            // Calcular dimensiones para llenar toda la página
            const imgWidth = 210;
            const imgHeight = 297;
            
            // Agregar imagen al PDF ocupando toda la página
            pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 
                0, 0, imgWidth, imgHeight, '', 'FAST');
            
            // Generar nombre del archivo
            const numero = document.getElementById('N_CONSECUTIVO').value || 'sin-numero';
            const nombreArchivo = `Cotizacion_${numero}.pdf`;
            
            // Descargar PDF
            pdf.save(nombreArchivo);
            
            mostrarMensaje('success', '✅ PDF generado exitosamente');
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            mostrarMensaje('error', '❌ Error al generar PDF: ' + error.message);
            
            // Fallback: intentar con método simple
            try {
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Cotización ${document.getElementById('N_CONSECUTIVO').value}</title>
                        <style>
                            @media print {
                                @page {
                                    size: A4;
                                    margin: 15mm;
                                }
                                body {
                                    font-family: Arial, sans-serif;
                                    font-size: 11pt;
                                    line-height: 1.3;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${previewDiv.innerHTML}
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(() => window.close(), 1000);
                            };
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();
                mostrarMensaje('info', '📄 PDF generado en nueva ventana para impresión');
            } catch (fallbackError) {
                console.error('Error fallback:', fallbackError);
            }
        }
    }

    // Función para imprimir directamente
    function imprimirCotizacion() {
        const printWindow = window.open('', '_blank');
        
        const printContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cotización ${document.getElementById('N_CONSECUTIVO').value}</title>
                <style>
                    @media print {
                        @page {
                            size: A4;
                            margin: 15mm;
                        }
                        body {
                            font-family: Arial, sans-serif;
                            font-size: 11pt;
                            line-height: 1.3;
                            margin: 0;
                            padding: 0;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            font-size: 9pt;
                        }
                        th, td {
                            border: 1px solid #000;
                            padding: 2mm;
                            text-align: center;
                        }
                        th {
                            background-color: #f0f0f0;
                        }
                    }
                    @media screen {
                        body {
                            padding: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                ${previewDiv.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
    }

    // Función para mostrar mensajes
    function mostrarMensaje(tipo, mensaje) {
        responseDiv.className = `response-message ${tipo}`;
        responseDiv.textContent = mensaje;
        
        setTimeout(() => {
            responseDiv.textContent = '';
            responseDiv.className = 'response-message';
        }, 5000);
    }

    // Inicializar
    mostrarMensaje('info', 'Complete los campos obligatorios (*) para generar la cotización');

});
