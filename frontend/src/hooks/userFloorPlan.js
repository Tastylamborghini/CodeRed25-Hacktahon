import { useState, useCallback, useEffect, useRef } from 'react';
import * as planService from '../services/planService';

const gridSize = 15;
const WALL_TYPE = { NONE: 0, WALL: 1, DOOR: 2, WINDOW: 3 };
const roomColors = ['#ffcc9980', '#add8e680', '#c8fac880', '#ffb4b480', '#e6e6fa80', '#ffc0cb80'];
const MAX_HISTORY = 20;

const getInitialState = () => ({
    horizontalWalls: Array(gridSize + 1).fill(null).map(() => Array(gridSize).fill(WALL_TYPE.NONE)),
    verticalWalls: Array(gridSize).fill(null).map(() => Array(gridSize + 1).fill(WALL_TYPE.NONE)),
    furniture: [],
});

// --- Utility Functions (Kept inside hook for closure/simplicity) ---
const isAreaOccupied = (newF, furniture, excludeId = null) => {
    if (newF.col < 0 || newF.row < 0 || newF.col + newF.w > gridSize || newF.row + newF.h > gridSize) {
        return true; 
    }
    for (const f of furniture) {
        if (f.id === excludeId) continue; 
        if (newF.col < f.col + f.w && newF.col + newF.w > f.col &&
            newF.row < f.row + f.h && newF.row + f.h > f.row) {
            return true;
        }
    }
    return false;
};

const isCollidingWithWall = (f, hWalls, vWalls) => {
    // Check collision logic from original monolith (simplified)
    const checkWall = (r, c, type) => {
        if (type === 'h') return r >= 0 && r <= gridSize && c >= 0 && c < gridSize && hWalls[r][c] === WALL_TYPE.WALL;
        if (type === 'v') return r >= 0 && r < gridSize && c >= 0 && c <= gridSize && vWalls[r][c] === WALL_TYPE.WALL;
        return false;
    };

    // Check against horizontal walls
    for (let r = f.row + 1; r < f.row + f.h; r++) { 
        for (let c = f.col; c < f.col + f.w; c++) {
            if (checkWall(r, c, 'h')) return true;
        }
    }
    // Check against vertical walls
    for (let c = f.col + 1; c < f.col + f.w; c++) { 
        for (let r = f.row; r < f.row + f.h; r++) {
             if (checkWall(r, c, 'v')) return true;
        }
    }
    return false;
};

const isWallSegmentBlockedByFurniture = (r, c, type, furniture) => {
    for (const f of furniture) {
        // Simplified check: if wall segment is inside furniture bounding box
        if (type === 'h') {
            if (r > f.row && r < f.row + f.h && c >= f.col && c < f.col + f.w) return true;
        } else { // type === 'v'
            if (c > f.col && c < f.col + f.w && r >= f.row && r < f.row + f.h) return true;
        }
    }
    return false;
};
// --- End Utility Functions ---


export const useFloorPlan = (svgRef) => {
    const [state, setState] = useState(getInitialState());
    const [rooms, setRooms] = useState([]);
    const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
    const [isDrawingWall, setIsDrawingWall] = useState(false);
    const [isDrawingFurniture, setIsDrawingFurniture] = useState(false);
    const [isMovingOrResizing, setIsMovingOrResizing] = useState(false);
    
    // Dialog State (for shadcn renaming)
    const [renameTarget, setRenameTarget] = useState(null); // { type: 'room'|'furniture', id: number, currentName: string }
    
    // Context Menu State
    const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, furnitureId: null });

    // Refs for mutable state during drag operations
    const historyStackRef = useRef([getInitialState()]);
    const historyIndexRef = useRef(0);
    const dragStartCellRef = useRef({ row: 0, col: 0 });
    const wallDragTypeRef = useRef('h');
    const wallPaintTypeRef = useRef(WALL_TYPE.WALL);
    const initialFurnitureRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const [dragPreview, setDragPreview] = useState(null);
    
    // Calculate cell size dynamically
    const cellSize = svgRef.current ? svgRef.current.clientWidth / (gridSize + 1) : 40;


    // --- Core Utilities for React-specific rendering ---
    const getSvgCoords = useCallback((e) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
        return { x: svgP.x, y: svgP.y };
    }, [svgRef]);

    // --- History & Persistence Logic ---

    const saveState = useCallback(async (newState) => {
        const stateToSave = newState || state;
        
        if (historyIndexRef.current < historyStackRef.current.length - 1) {
            historyStackRef.current = historyStackRef.current.slice(0, historyIndexRef.current + 1);
        }

        const newHistoryItem = {
            h: stateToSave.horizontalWalls,
            v: stateToSave.verticalWalls,
            f: stateToSave.furniture,
        };

        historyStackRef.current.push(newHistoryItem);
        
        if (historyStackRef.current.length > MAX_HISTORY) {
            historyStackRef.current.shift();
        }
        
        historyIndexRef.current = historyStackRef.current.length - 1;
        
        if (newState) {
            setState(newState);
        }
        
        // **API Call to Backend**
        try {
            await planService.savePlan(stateToSave);
        } catch (error) {
            console.error("Failed to save plan:", error);
        }

    }, [state]);

    const loadState = useCallback((index) => {
        if (index < 0 || index >= historyStackRef.current.length) return false;

        const stateToLoad = historyStackRef.current[index];
        setState({
            horizontalWalls: stateToLoad.h,
            verticalWalls: stateToLoad.v,
            furniture: stateToLoad.f,
        });
        historyIndexRef.current = index;
        return true;
    }, []);

    const undo = useCallback(() => loadState(historyIndexRef.current - 1), [loadState]);
    const redo = useCallback(() => loadState(historyIndexRef.current + 1), [loadState]);
    
    // --- Room Detection (Runs on state change) ---

    const detectRooms = useCallback(() => {
        // ... (BFS room detection logic from previous implementation) ...
        // This is where the complex BFS runs. Since it's identical to the previous monolith version,
        // we keep the function name and assume the complex logic is implemented here.
        const { horizontalWalls, verticalWalls } = state;
        let newRooms = [];
        let roomMap = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)); 
        let nextRoomId = 1;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (roomMap[r][c] === null) {
                    
                    let currentRoom = { id: nextRoomId, name: `Room ${nextRoomId}`, cells: [], color: roomColors[(nextRoomId - 1) % roomColors.length], minR: gridSize, maxR: -1, minC: gridSize, maxC: -1 };
                    const queue = [{r, c}];
                    roomMap[r][c] = nextRoomId;
                    let isBounded = true; 

                    while (queue.length > 0) {
                        // ... (BFS logic goes here) ...
                        const cell = queue.shift();
                        currentRoom.cells.push(cell);
                        currentRoom.minR = Math.min(currentRoom.minR, cell.r);
                        currentRoom.maxR = Math.max(currentRoom.maxR, cell.r);
                        currentRoom.minC = Math.min(currentRoom.minC, cell.c);
                        currentRoom.maxC = Math.max(currentRoom.maxC, cell.c);

                        const neighbors = [
                            { dr: -1, dc: 0, wallH: cell.r, wallV: null },
                            { dr: 1, dc: 0, wallH: cell.r + 1, wallV: null },
                            { dr: 0, dc: -1, wallH: null, wallV: cell.c },
                            { dr: 0, dc: 1, wallH: null, wallV: cell.c + 1 },
                        ];

                        for (const n of neighbors) {
                            const nr = cell.r + n.dr;
                            const nc = cell.c + n.dc;

                            let isBlocked = false;
                            if (n.wallH !== null) { 
                                isBlocked = horizontalWalls[n.wallH] && horizontalWalls[n.wallH][cell.c] !== WALL_TYPE.NONE;
                            } else if (n.wallV !== null) { 
                                isBlocked = verticalWalls[cell.r] && verticalWalls[cell.r][n.wallV] !== WALL_TYPE.NONE;
                            }

                            if (isBlocked) continue; 
                            
                            if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) {
                                isBounded = false; 
                                continue;
                            }
                            
                            if (roomMap[nr][nc] === null) {
                                roomMap[nr][nc] = nextRoomId;
                                queue.push({r: nr, c: nc});
                            }
                        }
                    }
                    
                    if (isBounded && currentRoom.cells.length > 0) {
                        currentRoom.centerX = (currentRoom.minC + currentRoom.maxC + 1) * cellSize / 2;
                        currentRoom.centerY = (currentRoom.minR + currentRoom.maxR + 1) * cellSize / 2;
                        newRooms.push(currentRoom);
                        nextRoomId++;
                    } else {
                        currentRoom.cells.forEach(cell => { roomMap[cell.r][cell.c] = -1; });
                    }
                }
            }
        }
        setRooms(newRooms);
    }, [state, cellSize]);

    // --- Furniture Actions (using Dialog for renaming) ---

    const startRename = useCallback((type, id, currentName) => {
        setRenameTarget({ type, id, currentName });
    }, []);

    const closeRenameDialog = useCallback(() => {
        setRenameTarget(null);
    }, []);

    const completeRename = useCallback((newName) => {
        if (!renameTarget || !newName) {
            setRenameTarget(null);
            return;
        }

        let newState = {...state};

        if (renameTarget.type === 'furniture') {
            newState = {
                ...state,
                furniture: state.furniture.map(f => f.id === renameTarget.id ? {...f, name: newName} : f),
            };
            setState(newState);
            saveState(newState);
        } else if (renameTarget.type === 'room') {
             setRooms(rooms.map(r => r.id === renameTarget.id ? {...r, name: newName} : r));
             // Room name change doesn't require floor state save, but a separate API call might be used.
        }
        setRenameTarget(null);
    }, [state, rooms, renameTarget, saveState]);
    
    const deleteFurniture = useCallback((id) => {
        const newState = {
            ...state,
            furniture: state.furniture.filter(f => f.id !== id),
        };
        setSelectedFurnitureId(null);
        setState(newState);
        saveState(newState);
    }, [state, saveState]);

    const handleContextMenu = useCallback((e, furnitureId) => {
        e.preventDefault();
        setSelectedFurnitureId(furnitureId);
        setContextMenu({
            isOpen: true,
            position: { x: e.clientX, y: e.clientY },
            furnitureId
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, furnitureId: null });
    }, []);

    const handleRenameFromContextMenu = useCallback(() => {
        const furniture = state.furniture.find(f => f.id === contextMenu.furnitureId);
        if (furniture) {
            startRename('furniture', furniture.id, furniture.name);
        }
    }, [state.furniture, contextMenu.furnitureId, startRename]);

    const handleDeleteFromContextMenu = useCallback(() => {
        if (contextMenu.furnitureId) {
            deleteFurniture(contextMenu.furnitureId);
        }
    }, [contextMenu.furnitureId, deleteFurniture]);


    // --- Mouse Handlers (Refactored to React/Synthetic Events) ---
    
    // Global Mouse Down Handler
    const handleMouseDown = useCallback((e) => {
        setSelectedFurnitureId(null);
        
        const target = e.target;
        
        // Exit furniture drawing mode if clicking on empty space
        if (isDrawingFurniture && (target.id === 'floor-plan-svg' || target.parentElement.id === 'interactive-group')) {
            setIsDrawingFurniture(false);
            return;
        }
        
        if (target.dataset.roomid) {
            const room = rooms.find(r => r.id === parseInt(target.dataset.roomid));
            if (room) startRename('room', room.id, room.name);
            return;
        }

        if (target.classList.contains('wall-line')) { // Wall drawing start
            const { type, row, col } = target.dataset;
            const r = parseInt(row);
            const c = parseInt(col);

            if (isWallSegmentBlockedByFurniture(r, c, type, state.furniture)) return; 
            
            setIsDrawingWall(true);
            
            let currentType = type === 'h' ? state.horizontalWalls[r][c] : state.verticalWalls[r][c];
            wallPaintTypeRef.current = (currentType + 1) % 4; // Cycle type
            wallDragTypeRef.current = type;

            const newState = {...state};
            if (type === 'h') newState.horizontalWalls[r][c] = wallPaintTypeRef.current;
            else newState.verticalWalls[r][c] = wallPaintTypeRef.current;
            setState(newState);
            
        } else if (target.classList.contains('furniture-rect') || target.classList.contains('resize-handle')) { // Furniture move/resize start
            const furnitureId = parseInt(target.dataset.id);
            setSelectedFurnitureId(furnitureId);
            setIsMovingOrResizing(true);
            
            const piece = state.furniture.find(f => f.id === furnitureId);
            initialFurnitureRef.current = JSON.parse(JSON.stringify(piece)); 
            
            const coords = getSvgCoords(e);
            
            if (target.classList.contains('furniture-rect')) {
                const rectX = (piece.col + 0.5) * cellSize;
                const rectY = (piece.row + 0.5) * cellSize;
                dragOffsetRef.current = { x: coords.x - rectX, y: coords.y - rectY };
                dragOffsetRef.current.action = 'move';
            } else {
                 dragOffsetRef.current = { x: coords.x, y: coords.y };
                 dragOffsetRef.current.action = 'resize';
                 dragOffsetRef.current.direction = target.dataset.direction;
            }

        } else if (target.id === 'floor-plan-svg' || target.parentElement.id === 'interactive-group' || target.parentElement.id === 'rooms-group') { // Furniture draw start
            // Only start furniture drawing if we're in furniture mode
            if (!isDrawingFurniture) return;
            
            const coords = getSvgCoords(e);
            dragStartCellRef.current = {
                col: Math.floor(coords.x / cellSize - 0.5),
                row: Math.floor(coords.y / cellSize - 0.5)
            };
            setDragPreview({
                x: (dragStartCellRef.current.col + 0.5) * cellSize,
                y: (dragStartCellRef.current.row + 0.5) * cellSize,
                width: 0,
                height: 0,
            });
        } else if (target.dataset.roomid && isDrawingFurniture) {
            // Handle clicks directly on room elements
            const coords = getSvgCoords(e);
            dragStartCellRef.current = {
                col: Math.floor(coords.x / cellSize - 0.5),
                row: Math.floor(coords.y / cellSize - 0.5)
            };
            setDragPreview({
                x: (dragStartCellRef.current.col + 0.5) * cellSize,
                y: (dragStartCellRef.current.row + 0.5) * cellSize,
                width: 0,
                height: 0,
            });
        } 
        
        if (isDrawingWall || isMovingOrResizing || isDrawingFurniture) e.preventDefault();
        
    }, [state, rooms, cellSize, getSvgCoords, startRename, isDrawingFurniture]);


    // Global Mouse Move Handler
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDrawingWall && !isDrawingFurniture && !isMovingOrResizing) return;
            
            const coords = getSvgCoords(e);
            let newState = JSON.parse(JSON.stringify(state)); // Deep copy for immutability

            if (isDrawingWall) {
                // Wall drawing: using elementFromPoint is necessary for the continuous drawing effect
                const element = document.elementFromPoint(e.clientX, e.clientY);
                if (element && element.classList.contains('wall-line') && element.dataset.type === wallDragTypeRef.current) {
                    const r = parseInt(element.dataset.row);
                    const c = parseInt(element.dataset.col);
                    
                    if (!isWallSegmentBlockedByFurniture(r, c, wallDragTypeRef.current, state.furniture)) {
                        if (wallDragTypeRef.current === 'h' && newState.horizontalWalls[r][c] !== wallPaintTypeRef.current) {
                            newState.horizontalWalls[r][c] = wallPaintTypeRef.current;
                            setState(newState);
                        } else if (wallDragTypeRef.current === 'v' && newState.verticalWalls[r][c] !== wallPaintTypeRef.current) {
                            newState.verticalWalls[r][c] = wallPaintTypeRef.current;
                            setState(newState);
                        }
                    }
                }
            } else if (isDrawingFurniture) {
                const currentCol = Math.max(0, Math.min(gridSize - 1, Math.floor(coords.x / cellSize - 0.5)));
                const currentRow = Math.max(0, Math.min(gridSize - 1, Math.floor(coords.y / cellSize - 0.5)));

                const startRow = Math.min(dragStartCellRef.current.row, currentRow);
                const startCol = Math.min(dragStartCellRef.current.col, currentCol);
                const endRow = Math.max(dragStartCellRef.current.row, currentRow);
                const endCol = Math.max(dragStartCellRef.current.col, currentCol);
                
                setDragPreview({
                    x: (startCol + 0.5) * cellSize,
                    y: (startRow + 0.5) * cellSize,
                    width: (endCol - startCol + 1) * cellSize,
                    height: (endRow - startRow + 1) * cellSize,
                });

            } else if (isMovingOrResizing) {
                const pieceIndex = newState.furniture.findIndex(f => f.id === selectedFurnitureId);
                const piece = newState.furniture[pieceIndex];
                const initial = initialFurnitureRef.current;
                if (!piece || !initial) return;
                
                if (dragOffsetRef.current.action === 'move') {
                    const newX = coords.x - dragOffsetRef.current.x;
                    const newY = coords.y - dragOffsetRef.current.y;

                    let newCol = Math.round(newX / cellSize - 0.5);
                    let newRow = Math.round(newY / cellSize - 0.5);
                    
                    newCol = Math.max(0, Math.min(gridSize - piece.w, newCol));
                    newRow = Math.max(0, Math.min(gridSize - piece.h, newRow));

                    piece.col = newCol;
                    piece.row = newRow;
                } else if (dragOffsetRef.current.action === 'resize') {
                    // Simplified resize to only bottom-right for brevity
                    const dx = coords.x - dragOffsetRef.current.x;
                    const dy = coords.y - dragOffsetRef.current.y;

                    const dCol = Math.round(dx / cellSize);
                    const dRow = Math.round(dy / cellSize);

                    let newW = Math.max(1, initial.w + dCol);
                    let newH = Math.max(1, initial.h + dRow);

                    newW = Math.min(newW, gridSize - initial.col);
                    newH = Math.min(newH, gridSize - initial.row);
                    
                    piece.w = newW;
                    piece.h = newH;
                }
                
                setState(newState); 
            }
        };

        const handleMouseUp = (e) => {
            let stateChanged = false;
            let newState = JSON.parse(JSON.stringify(state)); 
            
            if (isDrawingWall) {
                setIsDrawingWall(false);
                stateChanged = true;
            }
            
            if (isDrawingFurniture) {
                setDragPreview(null);
                
                const coords = getSvgCoords(e);
                const endCol = Math.max(0, Math.min(gridSize - 1, Math.floor(coords.x / cellSize - 0.5)));
                const endRow = Math.max(0, Math.min(gridSize - 1, Math.floor(coords.y / cellSize - 0.5)));
                
                const newFurniture = {
                    row: Math.min(dragStartCellRef.current.row, endRow),
                    col: Math.min(dragStartCellRef.current.col, endCol),
                    w: Math.abs(dragStartCellRef.current.col - endCol) + 1,
                    h: Math.abs(dragStartCellRef.current.row - endRow) + 1,
                    name: 'Item',
                    id: Date.now()
                };

                if (newFurniture.w > 0 && newFurniture.h > 0 && !isAreaOccupied(newFurniture, newState.furniture) && !isCollidingWithWall(newFurniture, newState.horizontalWalls, newState.verticalWalls)) {
                    newState.furniture.push(newFurniture);
                    setSelectedFurnitureId(newFurniture.id);
                    stateChanged = true;
                }
                
                setIsDrawingFurniture(false);
            }
            
            if (isMovingOrResizing) {
                const pieceIndex = newState.furniture.findIndex(f => f.id === selectedFurnitureId);
                const piece = newState.furniture[pieceIndex];
                const initial = initialFurnitureRef.current;
                
                if (piece && initial) {
                    // Final collision check: revert if invalid
                    if (isAreaOccupied(piece, newState.furniture, selectedFurnitureId) || isCollidingWithWall(piece, newState.horizontalWalls, newState.verticalWalls)) {
                        piece.col = initial.col;
                        piece.row = initial.row;
                        piece.w = initial.w;
                        piece.h = initial.h;
                    } else if (piece.col !== initial.col || piece.row !== initial.row || piece.w !== initial.w || piece.h !== initial.h) {
                        stateChanged = true;
                    }
                }
                setIsMovingOrResizing(false);
                initialFurnitureRef.current = null;
                // Force state update to re-render, even if reverted
                setState(newState);
            }
            
            if (stateChanged) {
                setState(newState);
                saveState(newState);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDrawingWall, isDrawingFurniture, isMovingOrResizing, selectedFurnitureId, state, cellSize, getSvgCoords, saveState]);


    // Effects
    useEffect(() => { detectRooms(); }, [state, cellSize, detectRooms]);
    useEffect(() => { saveState(getInitialState()); }, []); // Initial state save

    const clearAll = useCallback(() => {
        const clearedState = getInitialState();
        setState(clearedState);
        saveState(clearedState);
        setSelectedFurnitureId(null);
    }, [saveState]);

    return {
        state, rooms, selectedFurnitureId, cellSize, gridSize, WALL_TYPE, dragPreview,
        renameTarget, isDrawingFurniture, contextMenu,
        
        // Actions
        addFurniture: () => { 
            // Enable furniture drawing mode
            setIsDrawingFurniture(true);
        },
        deleteFurniture,
        handleContextMenu,
        closeContextMenu,
        handleRenameFromContextMenu,
        handleDeleteFromContextMenu,
        startRename,
        completeRename,
        closeRenameDialog,
        undo, redo,
        clearAll,
        
        // Handlers
        handleMouseDown,
    };
};