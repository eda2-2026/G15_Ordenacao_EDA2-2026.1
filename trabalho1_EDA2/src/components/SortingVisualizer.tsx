import { useState, useEffect, useRef, useCallback } from 'react';

const ALGORITHMS = [
  { id: 'bubble', name: 'Bubble Sort' },
  { id: 'insertion', name: 'Insertion Sort' },
  { id: 'merge', name: 'Merge Sort' },
  { id: 'quick', name: 'Quick Sort' },
  { id: 'heap', name: 'Heap Sort' },
];

const MOCK_DATA_SIZE = 100;

export default function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(ALGORITHMS[0].id);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [elapsedTime, setElapsedTime] = useState('0.000');
  const [swapCount, setSwapCount] = useState(0);
  const [comparisonCount, setComparisonCount] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const playBeep = useCallback((value: number, maxVal: number) => {
    if (!soundEnabled || !audioCtxRef.current) return;

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    oscillator.type = 'sine';

    const minFreq = 200;
    const maxFreq = 1000;
    oscillator.frequency.value = minFreq + (value / maxVal) * (maxFreq - minFreq);

    gainNode.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtxRef.current.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    oscillator.start();
    oscillator.stop(audioCtxRef.current.currentTime + 0.1);
  }, [soundEnabled]);

  const generateRandomArray = useCallback(() => {
    const newArr = [];
    for (let i = 0; i < MOCK_DATA_SIZE; i++) {
      newArr.push(Math.floor(Math.random() * 90) + 10);
    }
    setArray(newArr);
    setSwapCount(0);
    setComparisonCount(0);
    setElapsedTime('0.000');
  }, []);

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runBubbleSort = async () => {
    let arr = [...array];
    let swaps = 0;
    let comparisons = 0;
    const startTime = performance.now();

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        comparisons++;
        setComparisonCount(comparisons);

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          swaps++;
          setSwapCount(swaps);
          setArray([...arr]);
          playBeep(arr[j], 100);

          await sleep(20);
        }
      }
    }

    const endTime = performance.now();
    setElapsedTime((endTime - startTime).toFixed(3));
  };

  const runInsertionSort = async () => {
    const arr = [...array];
    let swaps = 0;
    let comparisons = 0;
    const startTime = performance.now();

    for (let i = 1; i < arr.length; i++) {
      const currentValue = arr[i];
      let j = i - 1;

      while (j >= 0) {
        comparisons++;
        setComparisonCount(comparisons);

        if (arr[j] <= currentValue) {
          break;
        }

        arr[j + 1] = arr[j];
        swaps++;
        setSwapCount(swaps);
        setArray([...arr]);
        playBeep(arr[j], 100);

        j--;
        await sleep(20);
      }

      arr[j + 1] = currentValue;
      setArray([...arr]);
      playBeep(currentValue, 100);
      await sleep(20);
    }

    const endTime = performance.now();
    setElapsedTime((endTime - startTime).toFixed(3));
  };

  const runQuickSort = async () => {
    const arr = [...array];
    let swaps = 0;
    let comparisons = 0;
    const startTime = performance.now();

    const swapValues = async (firstIndex: number, secondIndex: number) => {
      if (firstIndex === secondIndex) {
        return;
      }

      const temp = arr[firstIndex];
      arr[firstIndex] = arr[secondIndex];
      arr[secondIndex] = temp;
      swaps++;
      setSwapCount(swaps);
      setArray([...arr]);
      playBeep(arr[firstIndex], 100);
      await sleep(20);
    };

    const partition = async (low: number, high: number) => {
      const pivot = arr[high];
      let pivotIndex = low - 1;

      for (let j = low; j < high; j++) {
        comparisons++;
        setComparisonCount(comparisons);

        if (arr[j] < pivot) {
          pivotIndex++;
          await swapValues(pivotIndex, j);
        }
      }

      await swapValues(pivotIndex + 1, high);
      return pivotIndex + 1;
    };

    const quickSort = async (low: number, high: number): Promise<void> => {
      if (low >= high) {
        return;
      }

      const partitionIndex = await partition(low, high);
      await quickSort(low, partitionIndex - 1);
      await quickSort(partitionIndex + 1, high);
    };

    await quickSort(0, arr.length - 1);

    const endTime = performance.now();
    setElapsedTime((endTime - startTime).toFixed(3));
  };

  const handleSort = async () => {
    initAudio();
    if (isSorting) return;
    setIsSorting(true);
    setSwapCount(0);
    setComparisonCount(0);
    setElapsedTime('0.000');

    if (selectedAlgorithm === 'bubble') {
      await runBubbleSort();
    } else if (selectedAlgorithm === 'insertion') {
      await runInsertionSort();
    } else if (selectedAlgorithm === 'quick') {
      await runQuickSort();
    } else {
      // Mock provisório para outros algoritmos enquanto não são implementados
      let swaps = 0;
      const interval = setInterval(() => {
        setArray((prev) => {
          const nextArr = [...prev];
          const idx1 = Math.floor(Math.random() * prev.length);
          const idx2 = Math.floor(Math.random() * prev.length);
          const temp = nextArr[idx1];
          nextArr[idx1] = nextArr[idx2];
          nextArr[idx2] = temp;
          playBeep(nextArr[idx1], 100);
          return nextArr;
        });
        swaps++;
        setSwapCount(swaps);
        if (swaps >= 50) clearInterval(interval);
      }, 50);
      await sleep(2500); // Espera o tempo do mock terminar
    }

    setIsSorting(false);
  };

  return (
    <section className="mt-6 battle-card rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">Modo Ordenação</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Gamificação de Algoritmos</h1>
          <p className="mt-2 text-slate-600">
            Acompanhe visualmente a performance de 5 algoritmos de ordenação no banco de dados.
            (Amostra visual de {MOCK_DATA_SIZE} elementos)
          </p>
        </div>

        <button
          onClick={() => {
            initAudio();
            setSoundEnabled(!soundEnabled);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${soundEnabled ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'
            }`}
        >
          {soundEnabled ? ' Som Ativado' : ' Mudo'}
        </button>
      </div>

      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4 items-center md:items-end bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Escolha um algoritmo para testar
          </label>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isSorting}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 disabled:opacity-50"
          >
            {ALGORITHMS.map(alg => (
              <option key={alg.id} value={alg.id}>{alg.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={generateRandomArray}
          disabled={isSorting}
          className="w-full md:w-auto px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-200 transition disabled:opacity-50"
        >
          Embaralhar
        </button>

        <button
          onClick={handleSort}
          disabled={isSorting}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition disabled:opacity-50"
        >
          {isSorting ? 'Ordenando...' : 'Iniciar Ordenação'}
        </button>
      </div>

      {/* Visualizador */}
      <div className="bg-slate-900 rounded-xl p-4 h-64 flex items-end justify-center gap-[2px] overflow-hidden">
        {array.map((value, idx) => (
          <div
            key={idx}
            className="bg-sky-500 rounded-t-sm w-full transition-all duration-75"
            style={{ height: `${value}%` }}
          ></div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tempo de Execução</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{elapsedTime} <span className="text-sm font-normal text-slate-500">ms</span></p>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comparações</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{comparisonCount}</p>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trocas (Swaps)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{swapCount}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
