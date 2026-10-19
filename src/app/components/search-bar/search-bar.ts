import { Component, ElementRef, HostListener, ViewChild, computed, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBolt,
  faBoxesStacked,
  faChevronDown,
  faList,
  faMagnifyingGlass,
  faTableCellsLarge,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Reveal } from '../../directives/reveal';
import { Auto } from '../../interfaces/auto';

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'power-desc';
type View = 'grid' | 'list';

@Component({
  imports: [FontAwesomeModule, Reveal],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  readonly icons = { faBolt, faBoxesStacked, faChevronDown, faList, faMagnifyingGlass, faTableCellsLarge, faXmark };

  autos = input<Auto[]>([]);

  readonly searchTerm = signal('');
  readonly selectedBrands = signal<string[]>([]);
  readonly maxPrice = signal<number | null>(null);
  readonly sort = signal<SortKey>('default');
  readonly view = signal<View>('grid');
  readonly openId = signal<number | null>(null);

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  readonly brands = computed(() => [...new Set(this.autos().map(a => a.brand))]);

  readonly bounds = computed(() => {
    const prices = this.autos().map(a => a.price);
    return { min: Math.floor(Math.min(...prices, Infinity) / 10) * 10 || 0, max: Math.ceil(Math.max(...prices, 0) / 10) * 10 };
  });
  readonly priceLimit = computed(() => this.maxPrice() ?? this.bounds().max);

  readonly hasFilters = computed(
    () =>
      !!this.searchTerm().trim() ||
      this.selectedBrands().length > 0 ||
      this.priceLimit() < this.bounds().max ||
      this.sort() !== 'default',
  );

  readonly results = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    const brands = this.selectedBrands();
    const limit = this.priceLimit();

    const list = this.autos().filter(
      a =>
        (!brands.length || brands.includes(a.brand)) &&
        a.price <= limit &&
        `${a.brand} ${a.model}`.toLocaleLowerCase().includes(term),
    );

    switch (this.sort()) {
      case 'price-asc': return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'power-desc': return [...list].sort((a, b) => b.power - a.power);
      default: return list;
    }
  });

  toggleBrand(brand: string) {
    this.selectedBrands.update(b => (b.includes(brand) ? b.filter(x => x !== brand) : [...b, brand]));
  }

  toggleOpen(id: number) {
    this.openId.update(current => (current === id ? null : id));
  }

  setSort(value: string) {
    this.sort.set(value as SortKey);
  }

  reset() {
    this.searchTerm.set('');
    this.selectedBrands.set([]);
    this.maxPrice.set(null);
    this.sort.set('default');
  }

  /** Press "/" anywhere to jump to the search field. */
  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent) {
    const tag = (event.target as HTMLElement).tagName;
    if (event.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  }
}
