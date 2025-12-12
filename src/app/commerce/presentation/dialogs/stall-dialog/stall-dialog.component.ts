import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { selectOption, SelectSearchComponent } from '../../../../shared';
import { StallService } from '../../services';
import { Stall } from '../../../domain';

@Component({
  selector: 'app-stall-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    SelectSearchComponent,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Crear' }} Puesto</h2>
    <mat-dialog-content>
      <div class="py-2">
        <form [formGroup]="stallForm">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            @if(!data){
            <div class="sm:col-span-3">
              <select-search
                title="Seleccionar Mercado"
                [items]="markets()"
                (onSelect)="onSelect($event, 'marketId')"
                [required]="true"
              />
            </div>
            <div class="sm:col-span-3">
              <select-search
                title="Seleccionar Categoria"
                [items]="categories()"
                (onSelect)="onSelect($event, 'categoryId')"
                [required]="true"
              />
            </div>
            <div class="sm:col-span-3">
              <select-search
                title="Zona tibutaria"
                [items]="taxZones()"
                (onSelect)="onSelect($event, 'taxZoneId')"
                [required]="true"
              />
            </div>
            }
            <div class="sm:col-span-3">
              @if(currentTraderFullName()){
              <mat-form-field>
                <mat-label>Comerciante</mat-label>
                <input
                  matInput
                  type="text"
                  [value]="currentTraderFullName()"
                  readonly
                />
                <button
                  matSuffix
                  matIconButton
                  aria-label="Clear"
                  (click)="currentTraderFullName.set(null)"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </mat-form-field>
              } @else {
              <select-search
                (onTyped)="searchTraders($event)"
                title="Seleccionar Comerciante"
                placeholderLabel="Nombre o Numero de CI"
                [items]="traders()"
                [autoFilter]="false"
                (onSelect)="onSelect($event, 'traderId')"
                [required]="true"
              />
              }
            </div>
            @if(!data){
            <mat-form-field>
              <mat-label>Numero Piso</mat-label>
              <input matInput type="number" min="1" formControlName="floor" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Numero Puesto</mat-label>
              <input matInput type="number" formControlName="number" />
            </mat-form-field>
            }
            <mat-form-field>
              <mat-label>Area / m2</mat-label>
              <input matInput formControlName="area" type="number" step="0.01" />
            </mat-form-field>
            <div class="sm:col-span-2">
              <mat-form-field>
                <mat-label>Ubicacion puesto (OPCIONAL)</mat-label>
                <input
                  matInput
                  formControlName="location"
                  placeholder="Ejemplo: Seccion, pasillo"
                />
              </mat-form-field>
            </div>
          </div>
        </form>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="warn">Cancelar</button>
      <button mat-flat-button (click)="save()" [disabled]="stallForm.invalid">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StallDialogComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private stallService = inject(StallService);
  private dialogRef = inject(MatDialogRef);

  data: Stall | undefined = inject(MAT_DIALOG_DATA);

  stallForm = this.buildForm();
  traders = signal<selectOption<string>[]>([]);
  markets = toSignal(this.stallService.getMarkets(), { initialValue: [] });
  taxZones = toSignal(this.stallService.getTaxZones(), { initialValue: [] });
  categories = toSignal(this.stallService.getCategories(), {
    initialValue: [],
  });
  currentTraderFullName = signal<string | null>(null);

  ngOnInit(): void {
    this.currentTraderFullName.set(this.data?.trader?.fullName.trim() ?? null);
  }

  save(): void {
    const subscription = this.data
      ? this.stallService.update(this.data.id, this.stallForm.value)
      : this.stallService.create(this.stallForm.value);

    subscription.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  searchTraders(term: string) {
    return this.stallService.searchTraders(term).subscribe((resp) => {
      this.traders.set(resp);
    });
  }

  onSelect(
    value: string,
    formProperty: 'traderId' | 'marketId' | 'categoryId' | 'taxZoneId'
  ) {
    this.stallForm.get(formProperty)?.setValue(value);
  }

  private buildForm(): FormGroup {
    return this.data
      ? this.formBuilder.group({
          area: [this.data.area, Validators.required],
          location: [this.data.location, Validators.required],
          traderId: [this.data.trader?.id, Validators.required],
        })
      : this.formBuilder.group({
          number: ['', Validators.required],
          area: ['', Validators.required],
          floor: [
            null,
            [Validators.required, Validators.min(1), Validators.max(9999)],
          ],
          location: [''],
          traderId: ['', Validators.required],
          marketId: ['', Validators.required],
          categoryId: ['', Validators.required],
          taxZoneId: ['', Validators.required],
        });
  }
}
