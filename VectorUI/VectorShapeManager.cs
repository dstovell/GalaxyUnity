using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Vectrosity;

public class VectorShape
{
	public enum State
	{
		Intro,
		Ready,
		Outro,
		Finished
	}
	public State state;

	public VectorLine line = null;

	public List<Vector2> points = new List<Vector2>();
	public float lineWidth = 0.01f;
	public Color color = Color.cyan;
	public Vector2 startPosition = Vector2.zero;
	public Vector2 position = Vector2.zero;
	public int numSegments = 1;
	public float animationTime = 0.5f;
	public float delayTime = 0.0f;
	private float age = 0.0f; 

	public VectorShape(Color _color, Vector2 _position, int _numSegments, Vector2 _startPosition, float _animationTime = 0.0f, float _delayTime = 0.0f)
	{
		this.color = _color;
		this.position = _position;
		this.numSegments = _numSegments;

		this.animationTime = _animationTime;
		this.delayTime = _delayTime;
		this.startPosition = (_startPosition != Vector2.zero) ? _startPosition : _position;

		this.state = (this.animationTime > 0.0f) ? State.Intro : State.Ready;
		this.age = 0.0f;

		for (int i=0; i<=this.numSegments; i++)
		{
			this.points.Add(new Vector2());	
		}
	}

	public void SetColor(Color _color)
	{
		this.color = _color;
		if (this.line != null)
		{
			this.line.color = this.color;
		}
	}

	public void Create()
	{
		if (this.line == null)
		{
			float lw = ScaleSize(this.lineWidth);
			this.line = new VectorLine("VectorShape", this.points, null, lw, LineType.Continuous, Joins.Weld);
			this.line.color = color;
			this.line.capLength = lw * 0.5f;
		}
	}

	public void Update(float deltaT)
	{
		if (this.state == State.Intro)
		{
			this.age += deltaT;
			float delayedAge = Mathf.Max((this.age - this.delayTime), 0.0f);
			float t = Mathf.Min( (delayedAge / this.animationTime), 1.0f);
			UpdatePoints(t);

			if (t == 1.0f)
			{
				this.state = State.Ready;
				this.age = 0.0f;
				//Enabled collider here
			}
		}
		else if (this.state == State.Outro)
		{
			this.age += deltaT;
			float t = 1.0f - Mathf.Min( (this.age / this.animationTime), 1.0f);
			UpdatePoints(t);

			if (t == 1.0f)
			{
				this.state = State.Finished;
			}
		}
	}

	protected virtual void UpdatePoints(float t)
	{
	}

	public void Destroy()
	{
		if (this.line != null)
		{
			//Destroy line here I think...
			VectorLine.Destroy(ref this.line);
			this.line = null;
		}
	}

	public void Draw()
	{
		if (this.line != null)
		{
			this.line.Draw();
		}
	}

	public static float ScaleX(float t)
	{
		return Mathf.Floor(t*Screen.width);
	}

	public static float ScaleY(float t)
	{
		return Mathf.Floor(t*Screen.height);
	}

	public static Vector2 ScaleVector(Vector2 t)
	{
		return new Vector2(ScaleX(t.x), ScaleY(t.y));
	}

	public static float ScaleSize(float t)
	{
		int minDim = Mathf.Min(Screen.height, Screen.width);
		return Mathf.FloorToInt(t*minDim);
	}

	public static Vector2 LerpVector(Vector2 v0, Vector2 v1, float t)
	{
		return new Vector2( Mathf.Lerp(v0.x, v1.x, t),  Mathf.Lerp(v0.y, v1.y, t) );
	}
}

public class PolygonVectorShape : VectorShape
{
	public float radius = 0.0f;
	public float startingAngle = Mathf.PI/2.0f;

	public PolygonVectorShape(Color _color, Vector2 _position, int _numSegments, float _radius, Vector2 _startPosition, float _animationTime = 0.0f, float _delayTime = 0.0f)
		: base(_color, _position, _numSegments, _startPosition, _animationTime, _delayTime)
	{
		this.radius = _radius;

		UpdatePoints( (this.state == State.Ready) ? 1.0f : 0.0f );
	}

	protected override void UpdatePoints(float t)
	{
		Vector2 scaledPos = ScaleVector( LerpVector(this.startPosition, this.position, t) );
		float scaledRadius = ScaleSize( Mathf.Lerp(0.0001f, this.radius, t*t*t) );

		float thetaStep = 2*Mathf.PI / this.numSegments;
		for (int i=0; i<this.points.Count; i++)
		{
			float theta = i*thetaStep + this.startingAngle;
			float x = scaledPos.x + scaledRadius * (float)System.Math.Cos(theta);
			float y = scaledPos.y + scaledRadius * (float)System.Math.Sin(theta);
			this.points[i] = new Vector2(x, y);
		}
	}
}

public class DiamondVectorShape : PolygonVectorShape
{
	public DiamondVectorShape(Color _color, Vector2 _position, float _radius, Vector2 _startPosition, float _animationTime = 0.0f, float _delayTime = 0.0f)
		: base(_color, _position, 4, _radius, _startPosition, _animationTime, _delayTime)
	{
	}
}

public class SquareVectorShape : PolygonVectorShape
{
	public SquareVectorShape(Color _color, Vector2 _position, float _radius, Vector2 _startPosition, float _animationTime = 0.0f, float _delayTime = 0.0f)
		: base(_color, _position, 4, _radius, _startPosition, _animationTime, _delayTime)
	{
		this.startingAngle = Mathf.PI/4.0f;
	}
}

public class HexVectorShape : PolygonVectorShape
{
	public HexVectorShape(Color _color, Vector2 _position, float _radius, Vector2 _startPosition, float _animationTime = 0.0f, float _delayTime = 0.0f)
		: base(_color, _position, 6, _radius, _startPosition, _animationTime, _delayTime)
	{
	}
}

public class CircleVectorShape : PolygonVectorShape
{
	public CircleVectorShape(Color _color, Vector2 _position, float _radius, Vector2 _startPosition, float _animationTime = 0.0f, float _delayTime = 0.0f)
		: base(_color, _position, 30, _radius, _startPosition, _animationTime, _delayTime)
	{
	}
}

public class VectorShapeLayer 
{
	public VectorShapeLayer(string _name, Color _color)
	{
		this.name = _name;
		this.color = _color;
		this.shapes = new List<VectorShape>();
	}

	public void AddShape(VectorShape shape)
	{
		shape.SetColor(this.color);
		this.shapes.Add(shape);

		shape.Create();
	}

	public void Update(float deltaT)
	{
		for (int i=0; i<this.shapes.Count; i++)
		{
			shapes[i].Update(deltaT);
		}
	}

	public void Draw()
	{
		for (int i=0; i<this.shapes.Count; i++)
		{
			shapes[i].Draw();
		}
	}

	public string name;
	public Color color;
	public List<VectorShape> shapes;
}

public class VectorShapeManager : MonoBehaviour 
{
	static public VectorShapeManager Instance = null;

	private Dictionary<string, VectorShapeLayer> Layers;

	void Awake() 
	{
		Instance = this;

		Layers = new Dictionary<string, VectorShapeLayer>();
		Layers["info"] = new VectorShapeLayer("info", Color.cyan);
		Layers["ally"] = new VectorShapeLayer("ally", Color.green);
		Layers["enemy"] = new VectorShapeLayer("enemy", Color.red);
	}

	// Use this for initialization
	void Start() 
	{
	}

	public void AddShape(string layer, VectorShape shape)
	{
		if (this.Layers.ContainsKey(layer))
		{
			this.Layers[layer].AddShape(shape);
		}
	}
	
	// Update is called once per frame
	void LateUpdate () 
	{
		foreach(KeyValuePair<string, VectorShapeLayer> entry in this.Layers)
		{
			entry.Value.Update(Time.deltaTime);
			entry.Value.Draw();
		}
	}
}
