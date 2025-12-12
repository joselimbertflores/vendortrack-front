import { Injectable } from '@angular/core';
import { from, Observable, tap } from 'rxjs';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

import { formatDate, imageToBase64 } from '../../../helpers';
import { Certificate } from '../../commerce/domain';
import { environment } from '../../../environments/environment';

pdfMake.vfs = pdfFonts.vfs;

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  generate(certificate: Certificate) {
    return from(this.pdfContent(certificate)).pipe(
      tap((doc) => pdfMake.createPdf(doc).print())
    );
  }

  private async pdfContent(certificate: Certificate) {
    const headerIamge = await imageToBase64('images/logos/gams.png');
    const qrData = `${environment.publicUrl}/certificates/verify/${certificate.id}`;
    const photo = certificate.trader.photo
      ? await imageToBase64(certificate.trader.photo)
      : null;

    const doc: TDocumentDefinitions = {
      pageSize: 'LETTER',
      content: [
        { image: headerIamge, width: 160, alignment: 'center' },
        // {
        //   text: 'Documento sin validez oficial (PRUEBA)',
        //   color: 'red',
        //   bold: true,
        //   fontSize: 20,
        //   absolutePosition: { x: 40, y: 550 },
        //   opacity: 0.3,
        // },
        {
          text: 'CERTIFICADO DE CONCESIÓN DE SITIO MUNICIPAL',
          style: 'theme',
          alignment: 'center',
          fontSize: 25,
          margin: [0, 10, 0, 10],
        },
        {
          columns: [
            { width: 100, text: '' },
            {
              table: {
                widths: ['*'],
                body: [
                  [
                    {
                      text: [
                        { text: 'NºID: ', style: 'theme' },
                        { text: certificate.code, bold: true },
                      ],
                      fontSize: 30,
                      bold: true,
                      alignment: 'center',
                    },
                  ],
                ],
              },
              layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#003366',
                vLineColor: () => '#003366',
              },
            },
            { width: 100, text: '' },
          ],
        },
        {
          marginTop: 20,
          columns: [
            {
              width: '*',
              fontSize: 11,
              lineHeight: 1.8,
              stack: [
                {
                  text: [
                    { text: 'CONCESIONARIO: ', style: 'theme' },
                    { text: certificate.trader.fullName.toUpperCase() },
                  ],
                },
                {
                  text: [
                    { text: 'DIRECCIÓN: ', style: 'theme' },
                    { text: certificate.trader.address },
                  ],
                },
                {
                  text: [
                    { text: 'MERCADO: ', style: 'theme' },
                    { text: certificate.stall.market },
                  ],
                },
                {
                  text: [
                    { text: 'RUBRO: ', style: 'theme' },
                    { text: certificate.stall.category },
                  ],
                },
                {
                  columns: [
                    {
                      text: [
                        { text: 'PISO: ', style: 'theme' },
                        { text: certificate.stall.floor ?? '' },
                      ],
                    },
                    {
                      text: [
                        { text: 'SUP. M2: ', style: 'theme' },
                        { text: certificate.stall.area },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              alignment: 'center',
              width: 120,
              stack: [
                {
                  ...(photo
                    ? { image: photo, width: 80 }
                    : {
                        canvas: [
                          {
                            type: 'rect',
                            x: 0,
                            y: 0,
                            w: 80,
                            h: 80,
                            r: 0,
                            lineColor: '#000000',
                            lineWidth: 1,
                          },
                        ],
                      }),
                },
                {
                  marginTop: 15,
                  text: [
                    { text: 'C.I. Nº ', style: 'theme' },
                    { text: certificate.trader.dni },
                  ],
                },
              ],
            },
          ],
        },
        {
          marginTop: 10,
          fontSize: 11,
          lineHeight: 1.8,
          stack: [
            {
              text: [
                { text: 'Nº DE SITIO MUNICIPAL Y/O PUESTO: ', style: 'theme' },
                { text: certificate.stall.number },
              ],
            },
            {
              text: [
                { text: 'ZONA TRIBUTARIA: ', style: 'theme' },
                { text: certificate.stall.taxZone },
              ],
            },
            {
              columns: [
                {
                  text: [
                    {
                      text: 'FECHA DE CONCESION: ',
                      style: 'theme',
                    },
                    { text: formatDate(certificate.trader.grantDate) },
                  ],
                },
                {
                  text: [
                    {
                      text: 'MODALIDAD DE PAGO: ',
                      style: 'theme',
                    },
                    { text: certificate.paymentMethodLabel },
                  ],
                },
              ],
            },
          ],
        },
        {
          marginTop: 10,
          alignment: 'center',
          text: [
            {
              text: [
                { text: 'VIGENCIA: ', style: 'theme' },
                {
                  text: formatDate(certificate.startDate),
                  characterSpacing: 2,
                },
              ],
            },
            {
              text: [
                { text: '      AL: ', style: 'theme' },
                {
                  text: formatDate(certificate.endDate),
                  characterSpacing: 2,
                },
              ],
            },
          ],
        },
        {
          marginTop: 10,
          alignment: 'center',
          text: [
            { text: 'SACABA, ', style: 'theme' },
            {
              text: formatDate(new Date()),
              characterSpacing: 2,
            },
          ],
        },
        {
          marginTop: 10,
          marginBottom: 25,
          columns: [
            { text: '', width: 120 },
            {
              width: '*',
              text: 'VALIDEZ DE 2 AÑOS',
              alignment: 'center',
              fontSize: 20,
              color: 'red',
              bold: true,
            },
            {
              width: 120,
              alignment: 'right',
              qr: qrData,
              fit: 100,
            },
          ],
        },
        {
          style: 'theme',
          fontSize: 7,
          alignment: 'justify',
          text: 'DECRETO MUNICIPAL N° 004/2025 “REGLAMENTO DE MERCADOS PÚBLICOS, CENTROS DE ABASTO, SITIOS MUNICIPALES, FERIAS ZONALES, VÍAS PÚBLICAS Y ESTABLECIMIENTOS DE ACTIVIDADES ECONÓMICAS”, SECCION III - IDENTIFICACION DE CONCESION DE SITIO O PUESTO MUNICIPAL, MEJORAS DEL SITIO MUNICIPAL.',
        },
        {
          marginTop: 3,
          fontSize: 7,
          alignment: 'justify',
          text: [
            { text: 'Art. 6 núm. 6.- ', style: 'theme' },
            {
              style: 'subtext',
              text: 'Certificado de Concesión de Sitio Municipal.- Documento que acredita la concesión de un sitio Municipal en los mercados públicos de la jurisdicción de Sacaba, donde se podrá identificar los siguientes datos de vital importancia como ser: nombres, cédula de identidad, número de patente, nombre del mercado, número de puesto, fotografía del concesionario, fecha de concesión, rubro, superficie del sitio municipal, normativa aplicada, código electrónico QR, firma del Intendente Municipal y otros.',
            },
          ],
        },
        {
          marginTop: 3,
          fontSize: 7,
          alignment: 'justify',
          text: [
            { text: 'Art. 13 par. II.', style: 'theme' },
            {
              style: 'subtext',
              text: 'Con la finalidad de identificar a cada una de las comerciantes y/o concesionarias de un sitio municipal se extenderá la CERTIFICACIÓN DE SITIO MUNICIPAL, que contendrá los datos generales de la concesionaria, rubro, número de patente, fotografía y su registro en el sistema integrado de administración de Intendencia Municipal.',
            },
          ],
        },
        {
          marginTop: 3,
          fontSize: 7,
          alignment: 'justify',
          text: [
            { text: 'Art. 19 par. I.', style: 'theme' },
            {
              style: 'subtext',
              text: 'El Certificado de Concesión de Sitio Municipal tendrá la vigencia de 2 años. par. III. Todo concesionario de sitio Municipal de los diferentes mercados de Sacaba deberá contar con su CERTIFICADO DE CONCESIÓN DE SITIO MUNICIPAL y el NÚMERO DE SITIO MUNICIPAL con ACLARACIÓN DEL RUBRO, siendo que si no lo tuvieran deberá realizar en el plazo máximo de 30 días de su legal notificación. Al incumplimiento de la misma se procederá a sancionar en mérito a la presente normativa.',
            },
          ],
        },
        {
          marginTop: 3,
          fontSize: 7,
          alignment: 'justify',
          text: [
            { text: 'Art. 30 núm. 1.', style: 'theme' },
            {
              style: 'subtext',
              text: 'Contar con la certificación de concesión de sitio municipal y la numeración del sitio municipal con la aclaración del rubro y presentar cuando requiera la autoridad competente, toda la documentación que acredite su derecho sobre el sitio municipal.',
            },
          ],
        },
      ],
      pageMargins: [40, 40, 40, 30],
      background: function (_currentPage, pageSize) {
        return {
          canvas: [
            {
              type: 'rect',
              x: 20,
              y: 20,
              w: pageSize.width - 40,
              h: pageSize.height - 40,
              r: 10,
              lineColor: '#003366', // azul oscuro
              lineWidth: 3,
            },
          ],
        };
      },
      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
        },
        theme: {
          color: '#003366',
          bold: true,
        },
        subtext: {
          color: '#003366',
        },
      },
    };
    return doc;
  }
}
