import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TraderDialogComponent } from '../../dialogs';
import { TraderService } from '../../services';
import { Trader } from '../../../domain';
import { SearchInputComponent } from '../../../../shared';

@Component({
  selector: 'app-traders',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    SearchInputComponent,
  ],
  template: `
    <mat-toolbar>
      <span>Comerciantes</span>
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
        <search-input (onSearch)="search($event)" placeholder="Nombre / CI" />
      </div>
    </div>
    <table mat-table [dataSource]="dataSource()">
      <ng-container matColumnDef="fullName">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let element">
          {{ element.fullName | titlecase }}
        </td>
      </ng-container>

      <ng-container matColumnDef="dni">
        <th mat-header-cell *matHeaderCellDef>CI</th>
        <td mat-cell *matCellDef="let element">
          {{ element.dni }}
        </td>
      </ng-container>

      <ng-container matColumnDef="phone">
        <th mat-header-cell *matHeaderCellDef>Telefono</th>
        <td mat-cell *matCellDef="let element">
          @if(element.phone){
            {{ element.phone }}
          }
          @else {
            <span>----</span>
          }
        </td>
      </ng-container>

      <ng-container matColumnDef="address">
        <th mat-header-cell *matHeaderCellDef>Direccion</th>
        <td mat-cell *matCellDef="let element">
          {{ element.address }}
        </td>
      </ng-container>

      <ng-container matColumnDef="grantDate">
        <th mat-header-cell *matHeaderCellDef>Fecha concesion</th>
        <td mat-cell *matCellDef="let element">
          {{ element.grantDate | date : 'shortDate' }}
        </td>
      </ng-container>

      <ng-container matColumnDef="options">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let item" class="w-8">
          <button mat-icon-button (click)="update(item)">
            <mat-icon>edit</mat-icon>
          </button>
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
export default class TradersComponent implements OnInit {
  private dialogRef = inject(MatDialog);
  private traderService = inject(TraderService);

  dataSource = signal<Trader[]>([]);
  limit = signal<number>(10);
  index = signal<number>(0);
  dataSize = signal<number>(0);
  offset = computed<number>(() => this.limit() * this.index());
  term = signal<string>('');

  readonly COLUMNS = [
    'fullName',
    'dni',
    'phone',
    'grantDate',
    'address',
    'options',
  ];

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.traderService
      .findAll(this.limit(), this.offset(), this.term())
      .subscribe(({ traders, length }) => {
        this.dataSource.set(traders);
        this.dataSize.set(length);
      });
  }

  search(term: string) {
    this.term.set(term);
    this.index.set(0);
    this.getData();
  }

  create(): void {
    const dialogRef = this.dialogRef.open(TraderDialogComponent, {
      width: '700px',
      maxWidth: '700px',
    });
    dialogRef.afterClosed().subscribe((result?) => {
      if (!result) return;
      this.dataSource.update((val) => [result, ...val].slice(0, this.limit()));
      this.dataSize.update((value) => (value += 1));
    });
  }

  update(element: Trader) {
    const dialogRef = this.dialogRef.open(TraderDialogComponent, {
      width: '700px',
      maxWidth: '700px',
      data: element,
    });

    dialogRef.afterClosed().subscribe((result: Trader) => {
      if (!result) return;
      this.dataSource.update((values) => {
        const index = values.findIndex(({ id }) => id === result.id);
        values[index] = result;
        return [...values];
      });
    });
  }

  onPageChange({ pageIndex, pageSize }: PageEvent) {
    this.limit.set(pageSize);
    this.index.set(pageIndex);
    this.getData();
  }
}
