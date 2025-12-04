import { Component, ViewChild, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawingStroke, Point } from '../../models/types';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() isDrawer: boolean = false;
  @Output() strokeDrawn = new EventEmitter<DrawingStroke>();
  @Output() toolChanged = new EventEmitter<{ color: string; brushSize: number }>();
  @Output() canvasCleared = new EventEmitter<void>();

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastPoint: Point | null = null;
  private currentPoints: Point[] = [];

  currentColor = '#FFFFFF';
  brushSize = 5;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set darker background
    this.ctx.fillStyle = '#0f0617';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set initial canvas style with glow effect
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#FFFFFF';
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isDrawer) return;
    
    this.isDrawing = true;
    const point = this.getCanvasPoint(event);
    this.lastPoint = point;
    this.currentPoints = [point];
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawer || !this.isDrawing) return;
    
    const point = this.getCanvasPoint(event);
    this.currentPoints.push(point);
    
    // Draw locally for immediate feedback
    if (this.lastPoint) {
      this.drawLine(this.lastPoint, point, this.currentColor, this.brushSize);
    }
    
    this.lastPoint = point;
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.isDrawer || !this.isDrawing) return;
    
    this.isDrawing = false;
    
    if (this.currentPoints.length > 0) {
      const stroke: DrawingStroke = {
        type: 'line',
        points: this.currentPoints,
        color: this.currentColor,
        brushSize: this.brushSize,
        timestamp: Date.now()
      };
      
      this.strokeDrawn.emit(stroke);
    }
    
    this.currentPoints = [];
    this.lastPoint = null;
  }

  onMouseLeave(event: MouseEvent): void {
    if (this.isDrawing) {
      this.onMouseUp(event);
    }
  }

  private getCanvasPoint(event: MouseEvent): Point {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate the scale factor between canvas size and display size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  private drawLine(from: Point, to: Point, color: string, brushSize: number): void {
    // Add glow effect
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = color;
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = brushSize;
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();
  }

  drawStroke(stroke: DrawingStroke): void {
    if (stroke.type === 'clear') {
      this.clear();
      return;
    }

    if (stroke.points.length < 2) return;

    // Add glow effect
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = stroke.color;
    
    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.brushSize;
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    this.ctx.stroke();
  }

  clear(): void {
    const canvas = this.canvasRef.nativeElement;
    // Clear and redraw darker background
    this.ctx.fillStyle = '#0f0617';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  onClearCanvas(): void {
    this.clear();
    this.canvasCleared.emit();
  }

  onColorChange(): void {
    this.toolChanged.emit({ color: this.currentColor, brushSize: this.brushSize });
  }

  onBrushSizeChange(): void {
    this.toolChanged.emit({ color: this.currentColor, brushSize: this.brushSize });
  }
}
