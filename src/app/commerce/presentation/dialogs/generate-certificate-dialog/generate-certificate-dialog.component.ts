import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { switchMap } from 'rxjs';

import { CertificateService } from '../../services';
import { PdfService } from '../../../../shared';
import { Stall } from '../../../domain';

@Component({
  selector: 'app-generate-certificate-dialog',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Generacion Certificado</h2>
    <mat-dialog-content>
      <div class="py-2">
        <div>
          <div>
            <h3 class="text-lg font-medium">Detalle Comerciante</h3>
          </div>
          <div class="rounded-xl mt-4">
            @if(data.trader){
            <div
              class="flex flex-col sm:flex-row items-center gap-x-4 p-4 border rounded-xl"
            >
              <div class="block shrink-0">
                <img
                  alt="Trader photo"
                  [src]="data.trader.photo ?? 'images/no-image.png'"
                  class="size-32 rounded-lg object-cover"
                />
              </div>

              <div>
                <dl class="text-sm space-y-2">
                  <div class="flex">
                    <span class="w-34 font-medium text-gray-900">
                      Nombre:
                    </span>
                    <span class="text-gray-700 flex-1">
                      {{ data.trader.fullName | titlecase }}
                    </span>
                  </div>

                  <div class="flex">
                    <dt class="w-34 font-medium text-gray-900">CI:</dt>

                    <dd class="text-gray-700 sm:col-span-2">
                      {{ data.trader.dni }}
                    </dd>
                  </div>

                  <div class="flex">
                    <dt class="w-34 font-medium text-gray-900">
                      Fecha concesion:
                    </dt>

                    <dd class="text-gray-700 sm:col-span-2">
                      {{ data.trader.grantDate | date : 'shortDate' }}
                    </dd>
                  </div>

                  <div class="flex">
                    <dt class="w-34 font-medium text-gray-900">Direccion</dt>

                    <dd class="text-gray-700 sm:col-span-2">
                      {{ data.trader.address }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            }
          </div>
        </div>

        <div class="pt-4">
          <div class="px-4 sm:px-0">
            <h3 class="text-lg font-medium">Detalle Puesto</h3>
          </div>
          <div class="mt-2 border-t border-gray-100">
            <dl class="divide-y divide-gray-100">
              <div class="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt class="text-sm/6 font-medium text-gray-900">Numero:</dt>
                <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ data.number }}
                </dd>
              </div>
              <div class="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt class="text-sm/6 font-medium text-gray-900">Mercado:</dt>
                <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ data.market }}
                </dd>
              </div>
              <div class="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt class="text-sm/6 font-medium text-gray-900">Rubro:</dt>
                <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ data.category }}
                </dd>
              </div>
              <div class="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt class="text-sm/6 font-medium text-gray-900">Nro. Piso:</dt>
                <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ data.floor }}
                </dd>
              </div>
              <div class="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt class="text-sm/6 font-medium text-gray-900">Ubicacion:</dt>
                <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ data.location ?? '' }}
                </dd>
              </div>
              <div class="px-4 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt class="text-sm/6 font-medium text-gray-900">Area / m2:</dt>
                <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {{ data.area }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <form [formGroup]="certificateForm" class="mt-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <mat-form-field>
                <mat-label>Codigo</mat-label>
                <input matInput formControlName="code" type="number" />
              </mat-form-field>
            </div>
            <div>
              <mat-form-field>
                <mat-label>Meotodo de Pago</mat-label>
                <mat-select
                  [value]="paymentMethods[0]"
                  formControlName="paymentMethod"
                >
                  @for (method of paymentMethods; track $index) {
                  <mat-option [value]="method.value">
                    {{ method.label }}
                  </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </div>
        </form>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="warn">Cancelar</button>
      <button
        mat-flat-button
        [disabled]="certificateForm.invalid"
        (click)="save()"
      >
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateCertificateDialogComponent {
  private dialogRef = inject(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private pdfService = inject(PdfService);
  private certificateService = inject(CertificateService);

  data: Stall = inject(MAT_DIALOG_DATA);

  readonly paymentMethods = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia bancaria' },
  ];

  certificateForm = this.formBuilder.group({
    code: ['', Validators.required],
    paymentMethod: ['', Validators.required],
  });

  save() {
    this.certificateService
      .create(this.data.id, this.certificateForm.value)
      .pipe(
        switchMap((certiicate) => {
          return this.pdfService.generate(certiicate);
        })
      )
      .subscribe(() => {
        this.dialogRef.close();
      });
  }
}
