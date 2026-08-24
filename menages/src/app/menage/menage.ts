
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';


import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';

export interface Menage {
  id?: number;
  nomChefMenage: string;
  zone: string;
  nombrePersonnes: number;
  ageMoyen: number;
  typeLogement: string;
}

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-menage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './menage.html',
  styleUrl: './menage.css'
})
export class MenageComponent implements OnInit {
  private apiUrl = 'https://backendpopulation.onrender.com/api/menages';

  menageForm!: FormGroup;
  menages: Menage[] = [];
  toast: Toast | null = null;

  stats = {
    totalMenages: 0,
    populationTotale: 0,
    moyennePersonnes: 0,
    ageMoyenGlobal: 0,
    totalMaisons: 0,
    totalAppartements: 0,
    totalVillas: 0,
    totalZones: 0
  };

  typesLogement = ['Maison', 'Appartement', 'Villa', 'Studio'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef, // <-- Injecté ici
    private ngZone: NgZone // <-- Ajoute ceci
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.refreshAllData();
  }

  private initForm(): void {
    this.menageForm = this.fb.group({
      nomChefMenage: ['', [Validators.required, Validators.minLength(3)]],
      zone: ['', Validators.required],
      nombrePersonnes: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      ageMoyen: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      typeLogement: ['', Validators.required],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.menageForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  refreshAllData(): void {
    this.http.get<Menage[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.menages = data;
        this.calculateStats();
        this.cdr.detectChanges(); // <-- Force la mise à jour instantanée du DOM
      },
      error: () => this.showToast('Erreur lors du chargement des données', 'error')
    });
  }

  private calculateStats(): void {
    const total = this.menages.length;
    if (total === 0) {
      this.stats = { totalMenages: 0, populationTotale: 0, moyennePersonnes: 0, ageMoyenGlobal: 0, totalMaisons: 0, totalAppartements: 0, totalVillas: 0, totalZones: 0 };
      return;
    }

    const population = this.menages.reduce((sum, m) => sum + (Number(m.nombrePersonnes) || 0), 0);
    const sumAge = this.menages.reduce((sum, m) => sum + (Number(m.ageMoyen) || 0), 0);
    const zonesSet = new Set(this.menages.map(m => m.zone.trim().toLowerCase()));

    this.stats = {
      totalMenages: total,
      populationTotale: population,
      moyennePersonnes: Number((population / total).toFixed(1)),
      ageMoyenGlobal: Number((sumAge / total).toFixed(1)),
      totalMaisons: this.menages.filter(m => m.typeLogement === 'Maison').length,
      totalAppartements: this.menages.filter(m => m.typeLogement === 'Appartement').length,
      totalVillas: this.menages.filter(m => m.typeLogement === 'Villa').length,
      totalZones: zonesSet.size
    };
  }

  onSubmit(): void {
  if (this.menageForm.valid) {
    this.http.post<Menage>(this.apiUrl, this.menageForm.value).subscribe({
      next: (nouveauMenage) => {
        // ngZone.run force l'actualisation instantanée à l'écran
        this.ngZone.run(() => {
          this.showToast('Ménage enregistré avec succès !', 'success');
          this.menageForm.reset();
          
          // Option 1 : On ajoute directement le nouveau ménage reçu du backend dans la liste
          this.menages.push(nouveauMenage);
          this.calculateStats();
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Erreur POST:', err);
        this.showToast("Échec de l'enregistrement", 'error');
      }
    });
  } else {
    this.menageForm.markAllAsTouched();
  }
}

  onDelete(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce ménage ?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.showToast('Ménage supprimé avec succès.', 'success');
          this.refreshAllData();
        },
        error: () => this.showToast('Échec de la suppression', 'error')
      });
    }
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    this.cdr.detectChanges(); // <-- Rafraîchit aussi l'affichage du Toast
    setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 3500);
  }
}