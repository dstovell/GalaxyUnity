#pragma strict

import Vectrosity;

enum ShapeType
{
	LineSegment,
	Circle,
	Hex,
	
	NumTypes
}

class ShapeRenderNode
{
	var pointA : Vector3;
	var pointB : Vector3;
	var shapeSize : float;
	var index : int;
	var color : Color;
}

class ShapeRenderer
{
	var type : ShapeType;
	var numShapes : int;
	var lineWidth : float;
	var material : Material;
	
	var nextShapeIndex : int;
	var shapeNodes : ShapeRenderNode[] = null;
	var shapePoints : Vector3[] = null;
	var line : VectorLine = null;

	function InitForShapes(_type : ShapeType, _numShapes : int, _material : Material, _lineWidth : float)
	{
		type = _type;
		numShapes = _numShapes;
		material = _material;
		lineWidth = _lineWidth;
		
		shapeNodes = new ShapeRenderNode[numShapes];
		nextShapeIndex = 0;
		
		var numPoints : int = numShapes * GetShapeSegmentCount(type) * 2;
		shapePoints = new Vector3[numPoints];
		for (var i=0; i<numPoints; i++)
		{
			shapePoints[i] = new Vector3();
		}
		
		//Debug.Log("[InitForShapes] numShapes="+numShapes+" numPoints=" + numPoints);
	}
	
	function AddCircle(center : Vector3, up : Vector3, radius : float, color : Color) : int
	{
		if (type != ShapeType.Circle)
			return;
			
		var index : int = nextShapeIndex;
	
		shapeNodes[index] = new ShapeRenderNode();
		shapeNodes[index].pointA = center;
		shapeNodes[index].pointB = up;
		shapeNodes[index].shapeSize = radius;
		shapeNodes[index].color = color;
		
		var firstPoint : int = index * GetShapePointCount(type);
		shapeNodes[index].index = firstPoint;
		
		//Debug.Log("[AddCircle] index=" + index + " points[" + firstPoint + "," + (firstPoint+GetShapePointCount(type)-1) + "]");
		
		nextShapeIndex++;
		return index;
	}
	
	function AddLineSegment(pointA : Vector3, pointB : Vector3, color : Color) : int
	{
		if (type != ShapeType.LineSegment)
			return;
			
		var index : int = nextShapeIndex;
	
		shapeNodes[index] = new ShapeRenderNode();
		shapeNodes[index].pointA = pointA;
		shapeNodes[index].pointB = pointB;
		shapeNodes[index].shapeSize = 0.0;
		shapeNodes[index].color = color;
		
		var firstPoint : int = index * GetShapePointCount(type);
		shapeNodes[index].index = firstPoint;
		
		shapePoints[firstPoint] = pointA;
		shapePoints[firstPoint+1] = pointB;
		
		nextShapeIndex++;
		return index;
	}

	function AddHex(center : Vector3, up : Vector3, size : float, color : Color, startAngle : float) : int
	{
		if (type != ShapeType.Hex)
			return;
			
		var index : int = nextShapeIndex;
	
		shapeNodes[index] = new ShapeRenderNode();
		shapeNodes[index].pointA = center;
		shapeNodes[index].pointB = up;
		shapeNodes[index].shapeSize = size;
		shapeNodes[index].color = color;
		
		var firstPoint : int = index * GetShapePointCount(type);
		shapeNodes[index].index = firstPoint;
		
		var polyPoints : Vector3[] = ShapeTool.GetPolyPoints(center, 6, size, startAngle);
		var pointIndex : int = firstPoint;
		for (var i=0; i<polyPoints.Length-1; i++)
		{
			shapePoints[pointIndex] = polyPoints[i];
			pointIndex++;
			shapePoints[pointIndex] = polyPoints[i+1];
			pointIndex++;
		}
		
		//Debug.Log("[AddHex] index=" + index + " points[" + firstPoint + "," + (firstPoint+polyPoints.Length-1) + "]");		
		
		nextShapeIndex++;
		return index;
	}
	
	function UpdateColor(shapeIndex : int, color : Color)
	{
		if ((shapeIndex >= 0) && (shapeIndex < shapeNodes.Length))
		{
			shapeNodes[shapeIndex].color = color;
			
			if (line)
			{
				var segmentStart : int = shapeIndex * GetShapeSegmentCount(type);
				var segmentEnd : int = segmentStart + GetShapeSegmentCount(type) - 1;
				var segmentCount : int = GetShapeSegmentCount(type);
				line.SetColor(shapeNodes[shapeIndex].color, segmentStart, segmentEnd);
			}
		}
	}
	
	static function GetShapePointCount(_type : ShapeType) : int
	{
		return 2*GetShapeSegmentCount(_type);
	}
	
	static function GetShapeSegmentCount(_type : ShapeType) : int
	{
		switch(_type)
		{
			case ShapeType.LineSegment: return 1;
			case ShapeType.Circle: return 25;
			case ShapeType.Hex: return 6;
		}
		return 0;
	}
	
	function BeginRendering()
	{
	}
	
	function StopRendering()
	{
		if (line)
		{
			VectorLine.Destroy(line);
			line = null;
		}
	}
}