﻿using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Vectrosity;

public class VectorItem
{
	public enum Type
	{
		Hex,
		Circle
	}
	public Type type;

	public string text = string.Empty;
	public VectorItem parent = null;
	public List<VectorItem> children = new List<VectorItem>();
	public Vector2 position = Vector2.zero;
	public float size = 1.0f;
	public PolygonVectorShape shape = null;
	public int startSlot = 0;
	public int maxChildren = 0;

	public VectorItem(string _text, Type _type, VectorItem _parent, Vector2 _position, float _size, float delayTime = 0.0f)
	{
		this.text = text;
		this.type = _type;
		this.parent = _parent;
		this.position = _position;
		this.size = _size;
		Vector2 startPos = (this.parent != null) ? this.parent.position : this.position;
		if (this.type == Type.Hex)
		{
			this.maxChildren = 6;
			this.shape = new HexVectorShape(Color.white, this.position, this.size/2.0f, startPos, 0.5f, delayTime);
		}
		else 
		{
			this.maxChildren = 8;
			this.shape = new CircleVectorShape(Color.white, this.position, this.size/2.0f, startPos, 0.5f, delayTime);
		}
		VectorShapeManager.Instance.AddShape("info", this.shape);
	}

	public void AddChild(string _text, float delayTime = 0.0f)
	{
		//Debug.Log("AddChild " + _text);
		float childScale = 0.8f;
		float childSize = this.size*childScale;
		float thetaStep = 2*Mathf.PI / this.maxChildren;
		float theta = (this.maxChildren - this.children.Count + this.startSlot) * thetaStep;
		float childPosRadius = this.size/2.0f + childSize;
		float aspectRatio = ((float)Screen.width/(float)Screen.height);
		float x = this.position.x + childPosRadius/aspectRatio * (float)System.Math.Cos(theta);
		float y = this.position.y + childPosRadius * (float)System.Math.Sin(theta);

		Vector2 childPosition = new Vector2(x, y);

		VectorItem child = new VectorItem(_text, this.type, this, childPosition, childSize, delayTime);
		this.children.Add(child);
	}

	public void Update() 
	{
		if (this.shape.state == VectorShape.State.Ready)
		{
			if (this.children.Count < 3)
			{
				float delay = this.children.Count * 0.1f;
				AddChild(this.text + " - " + (this.children.Count+1), delay);
			}
		}
	}
}

public class VectorMenu : MonoBehaviour 
{
	public VectorItem rootMenu = null;

	void Start() 
	{
		float size = 0.17f;
		Vector2 screenPoint = new Vector2(0.12f, 0.9f);

		this.rootMenu = new VectorItem("Bonk", VectorItem.Type.Circle, null, screenPoint, size);
	}
	
	void Update() 
	{
		this.rootMenu.Update();
	}
}