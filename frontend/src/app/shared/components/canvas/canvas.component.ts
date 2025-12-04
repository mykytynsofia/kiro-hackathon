import { Component, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DrawingData, Stroke, ToolType } from '@monday-painter/models';

@Component({
  selector: 'app-canvas',
  template: `
    <div class="canvas-wrapper">
      <canvas
        #canvas
        [width]="width"
        [height]="height"
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp()"
        (mouseleave)="onMouseUp()"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onTouchEnd()"
        [class.readonly]="readonly">
      </canvas>
    </div>
  `,
  styles: [`
    .canvas-wrapper {
      position: relative;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    canvas {
      display: block;
      cursor: crosshair;
      touch-action: none;
    }

    canvas.readonly {
      cursor: default;
    }
  `]
})
export class CanvasComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() width = 800;
  @Input() height = 600;
  @Input() readonly = false;
  @Input() drawingData: DrawingData | null = null;
  @Output() drawingChange = new EventEmitter<DrawingData>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentStroke: Stroke | null = null;
  private strokes: Stroke[] = [];
  
  // Drawing settings
  currentColor = '#000000';
  currentWidth = 3;
  currentTool: ToolType = ToolType.BRUSH;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Load existing drawing if provided
    if (this.drawingData) {
      this.loadDrawing(this.drawingData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload drawing when drawingData input changes
    if (changes['drawingData'] && !changes['drawingData'].firstChange && this.ctx) {
      if (this.drawingData) {
        this.loadDrawing(this.drawingData);
      }
    }
  }

  // Mouse events
  onMouseDown(event: MouseEvent): void {
    if (this.readonly) return;
    
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.startStroke(x, y);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing || this.readonly) return;
    
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    this.continueStroke(x, y);
  }

  onMouseUp(): void {
    this.endStroke();
  }

  // Touch events
  onTouchStart(event: TouchEvent): void {
    if (this.readonly) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.startStroke(x, y);
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDrawing || this.readonly) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.continueStroke(x, y);
  }

  onTouchEnd(): void {
    this.endStroke();
  }

  // Drawing logic
  private startStroke(x: number, y: number): void {
    this.isDrawing = true;
    this.currentStroke = {
      points: [{ x, y }],
      color: this.currentTool === ToolType.ERASER ? '#FFFFFF' : this.currentColor,
      width: this.currentTool === ToolType.ERASER ? 20 : this.currentWidth,
      tool: this.currentTool
    };
  }

  private continueStroke(x: number, y: number): void {
    if (!this.currentStroke) return;
    
    this.currentStroke.points.push({ x, y });
    this.drawStroke(this.currentStroke);
  }

  private endStroke(): void {
    if (!this.isDrawing || !this.currentStroke) return;
    
    this.isDrawing = false;
    this.strokes.push(this.currentStroke);
    this.currentStroke = null;
    
    this.emitDrawingData();
  }

  private drawStroke(stroke: Stroke): void {
    if (stroke.points.length < 2) return;
    
    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    this.ctx.stroke();
  }

  // Public methods
  setColor(color: string): void {
    this.currentColor = color;
    this.currentTool = ToolType.BRUSH;
  }

  setWidth(width: number): void {
    this.currentWidth = width;
  }

  setEraser(): void {
    this.currentTool = ToolType.ERASER;
  }

  undo(): void {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this.redraw();
      this.emitDrawingData();
    }
  }

  clear(): void {
    this.strokes = [];
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.emitDrawingData();
  }

  getDrawingData(): DrawingData {
    return {
      strokes: this.strokes,
      width: this.width,
      height: this.height
    };
  }

  private loadDrawing(data: DrawingData): void {
    this.strokes = data.strokes || [];
    this.redraw();
  }

  private redraw(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.strokes.forEach(stroke => this.drawStroke(stroke));
  }

  private emitDrawingData(): void {
    this.drawingChange.emit(this.getDrawingData());
  }
}
