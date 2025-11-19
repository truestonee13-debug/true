import React from 'react';

// Type definitions copied from PromptGenerator.tsx for props consistency
type SceneCut = {
    cutNumber: string;
    description: string;
    narration: string;
    backgroundMusic: string;
    soundEffects: string;
    dynamicElements: string;
};

type Character = {
    name: string;
    description: string;
};

type GeneratedResult = {
    fullPrompt: string;
    characters: Character[];
    sceneCuts: SceneCut[];
};

type HistoryItem = {
    id: string;
    timestamp: number;
    verse: string;
    generatedResult: GeneratedResult;
    inputs: {
        verse: string;
        language: string;
        videoLength: string;
        cutLength: string;
        style: string;
        era: string;
        country: string;
        colorTone: string;
    };
};

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
);

type HistoryPanelProps = {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onLoad: (item: HistoryItem) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete, onClearAll }) => {
    return (
        <div 
            className={`fixed inset-0 z-50 flex justify-end ${isOpen ? 'visible' : 'invisible'}`} 
            role="dialog" 
            aria-modal="true"
        >
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
                aria-hidden="true"
                onClick={onClose}
            ></div>

            <div className={`relative z-10 flex flex-col w-full max-w-md h-full bg-gray-800 border-l border-gray-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 sticky top-0 bg-gray-800/80 backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-cyan-300">출력기록</h2>
                    <div className="flex items-center space-x-2">
                        {history.length > 0 && (
                             <button
                                onClick={() => {
                                    if(window.confirm('정말 모든 기록을 삭제하시겠습니까?')) {
                                        onClearAll();
                                    }
                                }}
                                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/50 px-2 py-1 rounded transition-colors"
                                title="모든 기록 삭제"
                            >
                                전체 삭제
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close history panel">
                           <CloseIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <p>아직 생성된 프롬프트가 없습니다.</p>
                             <p className="mt-2 text-sm">프롬프트를 생성하면 여기에 기록됩니다.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {history.map(item => (
                                <li key={item.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 transition-shadow hover:shadow-lg hover:border-gray-600">
                                    <p className="text-sm font-semibold text-gray-200 truncate" title={item.verse}>
                                        {item.verse}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(item.timestamp).toLocaleString('ko-KR')}
                                    </p>
                                    <div className="mt-3 flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
                                            title="삭제"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onLoad(item)}
                                            className="px-3 py-1 text-xs font-bold text-cyan-800 bg-cyan-300 rounded-md hover:bg-cyan-200 transition-colors"
                                        >
                                            불러오기
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPanel;
