import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { StallService } from '../../services';
import {
  StallDialogComponent,
  CertificateHistoryComponent,
  GenerateCertificateDialogComponent,
} from '../../dialogs';
import { Stall } from '../../../domain';
import { SearchInputComponent } from '../../../../shared';
@Component({
  selector: 'app-stalls',
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatButtonModule,
    MatToolbarModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  template: `
    <mat-toolbar>
      <span>Puestos</span>
      <div class="flex-1"></div>
      <div>
        <button mat-flat-button (click)="create()">
          <mat-icon>add</mat-icon>
          Agregar
        </button>
      </div>
    </mat-toolbar>
    <div class="flex justify-end py-2">
      <div class="w-full px-2 sm:w-1/4 h-11">
        <search-input
          (onSearch)="search($event)"
          placeholder="Nombre comerciante / Nro. puesto"
        />
      </div>
    </div>
    <table mat-table [dataSource]="dataSource()">
      <ng-container matColumnDef="number">
        <th mat-header-cell *matHeaderCellDef>Numero</th>
        <td mat-cell *matCellDef="let element" class="w-12">
          {{ element.number }}
        </td>
      </ng-container>

      <ng-container matColumnDef="market">
        <th mat-header-cell *matHeaderCellDef>Mercado</th>
        <td mat-cell *matCellDef="let element">
          {{ element.market }}
        </td>
      </ng-container>

      <ng-container matColumnDef="category">
        <th mat-header-cell *matHeaderCellDef>Categoria</th>
        <td mat-cell *matCellDef="let element">
          {{ element.category }}
        </td>
      </ng-container>

      <ng-container matColumnDef="location">
        <th mat-header-cell *matHeaderCellDef>Piso</th>
        <td mat-cell *matCellDef="let element">
          Piso {{ element.floor }}
        </td>
      </ng-container>
      <ng-container matColumnDef="area">
        <th mat-header-cell *matHeaderCellDef>Área / m2</th>
        <td mat-cell *matCellDef="let element">
          {{ element.area }}
        </td>
      </ng-container>

      <ng-container matColumnDef="trader">
        <th mat-header-cell *matHeaderCellDef>Comerciante</th>
        <td mat-cell *matCellDef="let element">
          {{ element.trader.fullName | titlecase }}
        </td>
      </ng-container>

      <ng-container matColumnDef="options">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let item" class="w-8">
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="update(item)">
              <mat-icon>edit</mat-icon>
              <span>Editar</span>
            </button>
            <button mat-menu-item (click)="generateCertificate(item)">
              <mat-icon>fact_check</mat-icon>
              <span>Generar certificado</span>
            </button>
            <button mat-menu-item (click)="certificateHistory(item)">
              <mat-icon>format_list_bulleted</mat-icon>
              <span>Historial de certificados</span>
            </button>
          </mat-menu>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="COLUMNS"></tr>
      <tr mat-row *matRowDef="let row; columns: COLUMNS"></tr>
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell p-3" colspan="4">No se encontraron resultados</td>
      </tr>
    </table>
    @if (dataSize() > limit()){
    <mat-paginator
      showFirstLastButtons
      [length]="dataSize()"
      [pageIndex]="index()"
      [pageSize]="10"
      (page)="onPageChange($event)"
    />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StallsComponent {
  private dialogRef = inject(MatDialog);
  private stallService = inject(StallService);

  dataSource = signal<Stall[]>([]);
  limit = signal<number>(10);
  index = signal<number>(0);
  dataSize = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  readonly COLUMNS = [
    'number',
    'market',
    'category',
    'location',
    'area',
    'trader',
    'options',
  ];

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.stallService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ stalls, length }) => {
        this.dataSource.set(stalls);
        this.dataSize.set(length);
      });
  }

  create(): void {
    const dialogRef = this.dialogRef.open(StallDialogComponent, {
      width: '700px',
      maxWidth: '700px',
    });
    dialogRef.afterClosed().subscribe((result?) => {
      if (!result) return;
      this.dataSource.update((values) =>
        [result, ...values].slice(0, this.limit())
      );
      this.dataSize.update((value) => (value += 1));
    });
  }

  update(element: Stall) {
    const dialogRef = this.dialogRef.open(StallDialogComponent, {
      width: '700px',
      maxWidth: '700px',
      data: element,
    });
    dialogRef.afterClosed().subscribe((result: Stall | undefined) => {
      if (!result) return;
      this.dataSource.update((values) => {
        const index = values.findIndex(({ id }) => id === result.id);
        values[index] = result;
        return [...values];
      });
    });
  }

  certificateHistory(item: Stall) {
    this.dialogRef.open(CertificateHistoryComponent, {
      width: '800px',
      maxWidth: '800px',
      data: item,
    });
  }

  async generateCertificate(item: any) {
    const dialogRef = this.dialogRef.open(GenerateCertificateDialogComponent, {
      width: '800px',
      maxWidth: '800px',
      data: item,
    });
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }

  search(term: string) {
    this.term.set(term);
    this.index.set(0);
    this.getData();
  }
}
