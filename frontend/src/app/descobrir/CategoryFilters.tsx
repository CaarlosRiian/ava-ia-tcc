interface Category {
  id: string;
  label: string;
  icon: string;
}

interface Props {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryFilters({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-10">
      <button
        onClick={() => onSelect(null)}
        className={`px-6 py-2 rounded-full text-sm font-bold cursor-pointer transition-all ${
          activeCategory === null
            ? "bg-[#2F52E0] text-white shadow-lg shadow-blue-100"
            : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 shadow-sm"
        }`}
      >
        Todos
      </button>
      
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-6 py-2 rounded-full text-sm cursor-pointer font-bold transition-all flex items-center gap-2 border ${
            activeCategory === cat.id
              ? "bg-[#2F52E0] border-[#2F52E0] text-white shadow-lg shadow-blue-100"
              : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50 shadow-sm"
          }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}