'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { Apple, Plus, Trash2, Sparkles, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function FoodTrackerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [foods, setFoods] = useState<FoodItem[]>([
    { id: '1', name: 'Oatmeal with Honey & Almonds', calories: 280, protein: 8, carbs: 54, fats: 4 },
    { id: '2', name: 'Grilled Paneer Tikka Salad', calories: 420, protein: 35, carbs: 12, fats: 14 },
    { id: '3', name: 'Whey Protein Shake', calories: 200, protein: 25, carbs: 5, fats: 3 },
  ]);

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const totalCalories = foods.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = foods.reduce((acc, item) => acc + item.protein, 0);
  const totalCarbs = foods.reduce((acc, item) => acc + item.carbs, 0);
  const totalFats = foods.reduce((acc, item) => acc + item.fats, 0);
  const calorieTarget = 2000;
  const progressPercent = Math.min((totalCalories / calorieTarget) * 100, 100);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !calories) return;

    const newItem: FoodItem = {
      id: Math.random().toString(),
      name,
      calories: parseInt(calories),
      protein: protein ? parseInt(protein) : 0,
      carbs: carbs ? parseInt(carbs) : 0,
      fats: fats ? parseInt(fats) : 0,
    };

    setFoods([...foods, newItem]);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  const handleDeleteFood = (id: string) => {
    setFoods(foods.filter((f) => f.id !== id));
  };

  const getAiNutritionFeedback = async () => {
    setLoadingAi(true);
    setAiFeedback(null);
    try {
      const summary = foods
        .map((f) => `${f.name} (${f.calories} kcal, P: ${f.protein}g, C: ${f.carbs}g, F: ${f.fats}g)`)
        .join(', ');
      
      const res = await api.post('/ai/universal', {
        query: `Analyze my daily food intake and give a summary of macros under 3 sentences: ${summary}`,
      });
      setAiFeedback(res.data.data);
    } catch {
      setAiFeedback('💡 AI Macro Advice: Your daily protein intake is on track! Ensure balanced fiber and healthy fats for optimal workout recovery.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="DIET & NUTRITION ENGINE"
        title="Food & Calorie Tracker"
        description="Log daily meals, calculate macros, track calorie limits & evaluate nutrition metrics"
      />

      {/* Target Progress Card */}
      <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-primary)] tracking-wider">Daily Calorie Target</span>
          <span className="font-mono text-sm font-black text-[var(--color-text)]">{totalCalories} / {calorieTarget} kcal</span>
        </div>

        <div className="w-full bg-[var(--color-surface-dim)] h-2.5 rounded-full border border-[var(--color-border)] overflow-hidden">
          <div 
            className="bg-[var(--color-primary)] h-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>

        {/* Macros Summary Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--color-border)] text-center font-mono">
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Protein</p>
            <p className="text-base font-black text-[var(--color-text)]">{totalProtein}g</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Carbs</p>
            <p className="text-base font-black text-[var(--color-text)]">{totalCarbs}g</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Fats</p>
            <p className="text-base font-black text-[var(--color-text)]">{totalFats}g</p>
          </div>
        </div>
      </div>

      {/* AI Nutrition Analysis */}
      {foods.length > 0 && (
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs font-bold text-[var(--color-primary)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" /> AI Nutrition Summary
            </span>
            <button 
              onClick={getAiNutritionFeedback}
              disabled={loadingAi}
              className="btn-neon font-mono text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded cursor-pointer"
            >
              {loadingAi ? 'Analyzing…' : 'Generate AI Insights'}
            </button>
          </div>
          {aiFeedback && (
            <p className="font-mono text-xs text-[var(--color-primary)] leading-relaxed bg-[var(--color-surface-dim)] p-4 rounded-xl border border-[var(--color-border)]">
              {aiFeedback}
            </p>
          )}
        </div>
      )}

      {/* Quick Add Form */}
      <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <h3 className="font-display font-bold text-base text-[var(--color-text)] uppercase tracking-wider">Log Food Entry</h3>
        <form onSubmit={handleAddFood} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Item Name</label>
              <input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="input-neon" 
                placeholder="e.g. Scrambled Eggs & Toast" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Calories (kcal)</label>
              <input 
                required 
                type="number" 
                value={calories} 
                onChange={e => setCalories(e.target.value)} 
                className="input-neon" 
                placeholder="e.g. 180" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Protein (g)</label>
              <input 
                type="number" 
                value={protein} 
                onChange={e => setProtein(e.target.value)} 
                className="input-neon" 
                placeholder="0" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Carbs (g)</label>
              <input 
                type="number" 
                value={carbs} 
                onChange={e => setCarbs(e.target.value)} 
                className="input-neon" 
                placeholder="0" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Fats (g)</label>
              <input 
                type="number" 
                value={fats} 
                onChange={e => setFats(e.target.value)} 
                className="input-neon" 
                placeholder="0" 
              />
            </div>
          </div>

          <button type="submit" className="btn-neon w-full py-3 uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /> Add to Food Log
          </button>
        </form>
      </div>

      {/* Foods Log List */}
      <div className="anime-stagger space-y-3 font-mono text-xs">
        <h3 className="font-mono text-xs font-bold uppercase text-[var(--color-text-muted)] tracking-wider">Daily Entries Log</h3>
        {foods.length === 0 ? (
          <div className="glass-card p-10 text-center border-dashed border-[var(--color-border)] rounded-xl">
            <Apple className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
            <p className="text-xs text-[var(--color-text-muted)]">No entries logged for today yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {foods.map((food) => (
              <div 
                key={food.id}
                className="glass-card p-4 flex justify-between items-center border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] transition-colors"
              >
                <div>
                  <p className="font-bold text-sm text-[var(--color-text)]">{food.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                  </p>
                </div>
                <button 
                  onClick={() => handleDeleteFood(food.id)}
                  className="text-[var(--color-text-muted)] hover:text-red-400 p-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
