import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Box3D, Vertex, BOX_COLORS } from '@/types';

interface Box3DEditorProps {
  imageUrl: string;
  boxes: Box3D[];
  selectedBoxId: string | null;
  onSelectBox: (boxId: string | null) => void;
  onUpdateBox: (boxId: string, vertices: Vertex[]) => void;
  onAddBox: () => void;
  readOnly?: boolean;
}

export function Box3DEditor({
  imageUrl,
  boxes,
  selectedBoxId,
  onSelectBox,
  onUpdateBox,
  onAddBox,
  readOnly = false,
}: Box3DEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingVertex, setDraggingVertex] = useState<{ boxId: string; vertexIndex: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate scale and offset to fit image in container
  useEffect(() => {
    if (!image || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    setContainerSize({ width: containerWidth, height: containerHeight });

    const scaleX = containerWidth / image.width;
    const scaleY = containerHeight / image.height;
    const newScale = Math.min(scaleX, scaleY, 1);

    const scaledWidth = image.width * newScale;
    const scaledHeight = image.height * newScale;

    setScale(newScale);
    setOffset({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2,
    });
  }, [image, containerSize.width, containerSize.height]);

  // Draw canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    canvas.width = containerSize.width;
    canvas.height = containerSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0);
    ctx.restore();

    // Draw boxes
    boxes.forEach((box) => {
      const isSelected = box.id === selectedBoxId;
      const color = BOX_COLORS.find(c => c.name === box.color)?.value || BOX_COLORS[0].value;
      
      drawBox3D(ctx, box, color, isSelected, scale, offset);
    });
  }, [image, boxes, selectedBoxId, scale, offset, containerSize]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0) {
        clientX = (e as TouchEvent).changedTouches[0]?.clientX || 0;
        clientY = (e as TouchEvent).changedTouches[0]?.clientY || 0;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left - offset.x) / scale,
      y: (clientY - rect.top - offset.y) / scale,
    };
  };

  const findVertexAtPosition = (pos: { x: number; y: number }) => {
    const threshold = 20 / scale;

    if (selectedBoxId) {
      const selectedBox = boxes.find(b => b.id === selectedBoxId);
      if (selectedBox) {
        for (let i = 0; i < selectedBox.vertices.length; i++) {
          const v = selectedBox.vertices[i];
          const dist = Math.sqrt((pos.x - v.x) ** 2 + (pos.y - v.y) ** 2);
          if (dist < threshold) {
            return { boxId: selectedBox.id, vertexIndex: i };
          }
        }
      }
    }

    for (const box of boxes) {
      if (box.id === selectedBoxId) continue;
      for (let i = 0; i < box.vertices.length; i++) {
        const v = box.vertices[i];
        const dist = Math.sqrt((pos.x - v.x) ** 2 + (pos.y - v.y) ** 2);
        if (dist < threshold) {
          return { boxId: box.id, vertexIndex: i };
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const pos = getMousePos(e);
    const vertex = findVertexAtPosition(pos);

    if (vertex) {
      setDraggingVertex(vertex);
      onSelectBox(vertex.boxId);
    } else {
      for (const box of boxes) {
        if (isPointInBox(pos, box)) {
          onSelectBox(box.id);
          return;
        }
      }
      onSelectBox(null);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingVertex || readOnly) return;
    
    e.preventDefault();
    e.stopPropagation();

    const pos = getMousePos(e);
    const box = boxes.find(b => b.id === draggingVertex.boxId);
    if (!box || !image) return;

    const clampedX = Math.max(0, Math.min(pos.x, image.width));
    const clampedY = Math.max(0, Math.min(pos.y, image.height));

    const newVertices = [...box.vertices];
    newVertices[draggingVertex.vertexIndex] = { x: clampedX, y: clampedY };
    onUpdateBox(draggingVertex.boxId, newVertices);
  }, [draggingVertex, boxes, onUpdateBox, readOnly, image]);

  const handleMouseUp = useCallback(() => {
    setDraggingVertex(null);
  }, []);

  useEffect(() => {
    if (draggingVertex && !readOnly) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      document.addEventListener('touchcancel', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
        document.removeEventListener('touchcancel', handleMouseUp);
      };
    }
  }, [draggingVertex, readOnly, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[300px] bg-muted rounded-lg overflow-hidden touch-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ touchAction: 'none' }}
      />
     
    </div>
  );
}

function drawBox3D(
  ctx: CanvasRenderingContext2D,
  box: Box3D,
  color: string,
  isSelected: boolean,
  scale: number,
  offset: { x: number; y: number }
) {
  const v = box.vertices.map(vertex => ({
    x: vertex.x * scale + offset.x,
    y: vertex.y * scale + offset.y,
  }));

  if (v.length < 8) return;

  // Línies més fines i elegants
  ctx.lineWidth = isSelected ? 3 : 2;
  ctx.strokeStyle = color;
  // Augmentar l'opacitat de 0.15 a 0.45 per fer-la més visible
  ctx.fillStyle = color.replace(')', ', 0.45)').replace('hsl', 'hsla');

  // Front face
  ctx.beginPath();
  ctx.moveTo(v[0].x, v[0].y);
  ctx.lineTo(v[1].x, v[1].y);
  ctx.lineTo(v[2].x, v[2].y);
  ctx.lineTo(v[3].x, v[3].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Back face
  ctx.beginPath();
  ctx.moveTo(v[4].x, v[4].y);
  ctx.lineTo(v[5].x, v[5].y);
  ctx.lineTo(v[6].x, v[6].y);
  ctx.lineTo(v[7].x, v[7].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Connecting edges (depth)
  ctx.setLineDash([8, 4]);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(v[i].x, v[i].y);
    ctx.lineTo(v[i + 4].x, v[i + 4].y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Vèrtex més petits i elegants
  v.forEach((vertex, i) => {
    ctx.beginPath();
    // Vèrtex més petits: 7px si està seleccionat, 6px si no
    ctx.arc(vertex.x, vertex.y, isSelected ? 7 : 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw measurements if available
  if (box.dimensions.width > 0 || box.dimensions.height > 0 || box.dimensions.depth > 0) {
    drawMeasurements(ctx, box, v);
  }

  // Draw label
  
}

function drawMeasurements(
  ctx: CanvasRenderingContext2D,
  box: Box3D,
  v: { x: number; y: number }[]
) {
  const { width, height, depth } = box.dimensions;

  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Width (bottom edge)
  if (width > 0) {
    const midX = (v[0].x + v[1].x) / 2;
    const midY = (v[0].y + v[1].y) / 2 + 30;
    drawTextWithOutline(ctx, `${width}cm`, midX, midY);
  }

  // Height (left edge)
  if (height > 0) {
    const midX = (v[0].x + v[3].x) / 2 - 35;
    const midY = (v[0].y + v[3].y) / 2;
    drawTextWithOutline(ctx, `${height}cm`, midX, midY);
  }

  // Depth (diagonal edge)
  if (depth > 0) {
    const midX = (v[0].x + v[4].x) / 2 + 25;
    const midY = (v[0].y + v[4].y) / 2 - 15;
    drawTextWithOutline(ctx, `${depth}cm`, midX, midY);
  }
}

function drawTextWithOutline(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 4;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText(text, x, y);
}

function isPointInBox(pos: { x: number; y: number }, box: Box3D): boolean {
  const v = box.vertices;
  if (v.length < 4) return false;

  const minX = Math.min(v[0].x, v[1].x, v[2].x, v[3].x);
  const maxX = Math.max(v[0].x, v[1].x, v[2].x, v[3].x);
  const minY = Math.min(v[0].y, v[1].y, v[2].y, v[3].y);
  const maxY = Math.max(v[0].y, v[1].y, v[2].y, v[3].y);

  return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
}

export function createDefaultBox3D(imageWidth: number, imageHeight: number, colorIndex: number): Omit<Box3D, 'id'> {
  const centerX = imageWidth / 2;
  const centerY = imageHeight / 2;
  // Fer el cub MOLT més gran (70% de la imatge en lloc de 30%)
  const size = Math.min(imageWidth, imageHeight) * 0.7;
  const depth = size * 0.4;

  return {
    vertices: [
      // Front face (bottom-left, bottom-right, top-right, top-left)
      { x: centerX - size / 2, y: centerY + size / 2 },
      { x: centerX + size / 2, y: centerY + size / 2 },
      { x: centerX + size / 2, y: centerY - size / 2 },
      { x: centerX - size / 2, y: centerY - size / 2 },
      // Back face (offset for 3D effect)
      { x: centerX - size / 2 + depth, y: centerY + size / 2 - depth },
      { x: centerX + size / 2 + depth, y: centerY + size / 2 - depth },
      { x: centerX + size / 2 + depth, y: centerY - size / 2 - depth },
      { x: centerX - size / 2 + depth, y: centerY - size / 2 - depth },
    ],
    dimensions: { width: 0, height: 0, depth: 0 },
    label: '',
    color: BOX_COLORS[colorIndex % BOX_COLORS.length].name,
  };
}
