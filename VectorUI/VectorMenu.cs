using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using Vectrosity;

public class VectorItem
{
	public enum Type
	{
		Square,
		Diamond,
		Hex,
		Circle
	}
	public Type type;

	public string text = string.Empty;
	public string originalText = string.Empty;
	public VectorItem parent = null;
	public List<VectorItem> children = new List<VectorItem>();
	public Vector2 position = Vector2.zero;
	public float size = 1.0f;
	private float minSize = 0.05f;
	public PolygonVectorShape shape = null;
	public int startSlot = 0;
	public int maxChildren = 0;

	public VectorItem(string _text, Type _type, VectorItem _parent, Vector2 _position, float _size, float delayTime = 0.0f)
	{
		this.text = _text;
		this.originalText = _text;
		this.type = _type;
		this.parent = _parent;
		this.position = _position;
		this.size = Mathf.Max(_size, this.minSize);
		Vector2 startPos = (this.parent != null) ? this.parent.position : this.position;
		if (this.type == Type.Square)
		{
			this.maxChildren = 8;
			this.shape = new SquareVectorShape(Color.white, this.position, this.size/2.0f, startPos, 0.5f, delayTime);
		}
		else if (this.type == Type.Diamond)
		{
			this.maxChildren = 8;
			this.shape = new DiamondVectorShape(Color.white, this.position, this.size/2.0f, startPos, 0.5f, delayTime);
		}
		else if (this.type == Type.Hex)
		{
			this.maxChildren = 6;
			this.shape = new HexVectorShape(Color.white, this.position, this.size/2.0f, startPos, 0.5f, delayTime);
		}

		else 
		{
			this.maxChildren = 8;
			this.shape = new CircleVectorShape(Color.white, this.position, this.size/2.0f, startPos, 0.5f, delayTime);
		}

		//this.shape.lineWidth = 0.04f * _size;
		VectorShapeManager.Instance.AddShape("info", this.shape);
	}

	public VectorItem(Vector2 _position, float _size)
	{
		this.position = _position;
		this.size = Mathf.Max(_size, this.minSize);
	}

	public void CloseAndDestroy()
	{
		this.shape.state = VectorShape.State.Outro;
	}

	public void Destroy()
	{
		for (int i=0; i<this.children.Count; i++)
		{
			this.children[i].Destroy();
		}
		this.children.Clear();

		if (this.shape != null)
		{
			VectorLine.Destroy(ref this.shape.line);
		}
	}

	public Vector2 GetChildPosition(float childSize, int index)
	{
		float thetaStep = 2*Mathf.PI / this.maxChildren;
		float theta = (this.maxChildren - index) * thetaStep;
		float childPosRadius = this.size*0.5f + childSize*0.6f;
		float aspectRatio = ((float)Screen.width/(float)Screen.height);
		float x = this.position.x + childPosRadius/aspectRatio * (float)System.Math.Cos(theta);
		float y = this.position.y + childPosRadius * (float)System.Math.Sin(theta);
		Vector2 position = new Vector2(x, y);
		return position;
	}

	public void AddChild(string _text, float delayTime = 0.0f)
	{
		//Debug.Log("AddChild " + _text);
		float childScale = 0.8f;
		float childSize = this.size*childScale;
		Vector2 childPosition = this.GetChildPosition(childSize, this.children.Count + this.startSlot);

		VectorItem child = new VectorItem(_text, this.type, this, childPosition, childSize, delayTime);
		this.children.Add(child);
	}

	public void AddChild(VectorItem child)
	{
		this.children.Add(child);
	}

	public void Update() 
	{
		if ((this.shape == null) || (this.shape.state == VectorShape.State.Ready))
		{
			/*if (this.parent == null)
			{
				if (this.children.Count < 3)
				{
					float delay = this.children.Count * 0.1f;
					AddChild("OPT " + (this.children.Count+1), delay);
				}
			}*/

			for (int i=0; i<this.children.Count; i++)
			{
				this.children[i].Update();
			}
		}

		if ((this.shape != null) && this.shape.state == VectorShape.State.Ready)
		{
			if (this.shape.state == VectorShape.State.Finished)
			{
				this.Destroy();
			}
		}
	}

	public void OnGUIUpdate() 
	{
		if ((this.shape == null) || (this.shape.state == VectorShape.State.Ready))
		{
			this.OnGUI();

			for (int i=0; i<this.children.Count; i++)
			{
				this.children[i].OnGUIUpdate();
			}
		}
	}

	protected virtual void OnGUI() 
	{
	}
}

public class InfoVectorItem : VectorItem
{
	private GS.Galaxy galaxy;
	private GS.StarData data;

	public InfoVectorItem(string text, Vector2 _position, float _size, GS.StarData _data) 
	: base(text, VectorItem.Type.Square, null, _position, _size)
	{
		this.galaxy = GS.GameflowManager.Instance.galaxyManager.galaxy;
		this.data = _data;
	}

	protected override void OnGUI() 
	{
		GUI.backgroundColor = Color.black;
		GUIStyle style = new GUIStyle(GUI.skin.label);
		style.fontStyle = FontStyle.Bold;
		style.richText = true;
		style.fontSize = Mathf.FloorToInt(VectorShape.ScaleSize(0.03f));
		style.wordWrap = true; 
		//style.fontStyle
		float boarderSize = 6.0f;
		float sizeX =  (shape.points[0].x - shape.points[2].x - 2.0f*boarderSize);
		float sizeY =  (shape.points[0].y - shape.points[2].y - 2.0f*boarderSize);
		float x = shape.points[2].x + boarderSize;
		float y = ((Screen.height - shape.points[2].y)+boarderSize-sizeY- 2.0f*boarderSize);
		Rect buttonRect = new Rect(x, y, sizeX, sizeY);

		GUILayout.BeginArea(buttonRect);
		//GUILayout.Label("<color=cyan>" + this.text + "</color>", style);
		GUILayout.Box("<color=cyan>" + this.text + "</color>", style);
		GUILayout.EndArea();
		//GUI.Label(buttonRect, "<color=cyan>" + this.text + "</color>", style);
	}
}

public class StarVectorItem : VectorItem
{
	private int starId;
	private GS.StarData star;
	private GS.Galaxy galaxy;

	public StarVectorItem(int _starId, Vector2 _position, float _size) 
	: base("", VectorItem.Type.Diamond, null, _position, _size)
	{
		this.galaxy = GS.GameflowManager.Instance.galaxyManager.galaxy;
		this.starId = _starId;
		this.star = galaxy.Stars.ContainsKey(this.starId) ? galaxy.Stars[this.starId] : null;

		string infoText = "ST-" + this.starId + "\n\n";
		infoText += "Class: " + this.star.Class + "\n";
		infoText += "Solar Mass: " + this.star.Mass + "\n";
		infoText += "Solar Radii: " + this.star.Radius + "\n";

		int habitablePlanets = 0;
		for (int i=0; i<this.star.Planets.Count; i++)
		{
			GS.PlanetData planet = this.star.Planets[i];
			if (this.star.HabitableZone.IsInRange(planet.OribitalDistance) && (planet.Class == "m"))
			{
				habitablePlanets++;
			}
		}
		infoText += "Planets: " + this.star.Planets.Count + "\n";
		infoText += "Habitable Planets: " + habitablePlanets + "\n";

		infoText += "Links: " + this.star.Links.Count + "\n";

		float size = 0.50f;
		Vector2 childPosition = this.GetChildPosition(size, 1);
		VectorItem child = new InfoVectorItem(infoText, childPosition, size, this.star);
		this.AddChild(child);
	}

	protected override void OnGUI() 
	{
		
	}
}

public class RandomStarVectorItem : VectorItem
{
	private int randomStarId;
	private bool showingStar;
	private GS.GalaxyManager galaxyManager;

	public RandomStarVectorItem(VectorItem _parent, Vector2 _position, float _size) 
	: base("RANDOM STAR", VectorItem.Type.Square, _parent, _position, _size)
	{
		this.galaxyManager = GS.GameflowManager.Instance.galaxyManager;
		NewRandomStar();
		this.showingStar = false;
	}

	private void NewRandomStar()
	{
		for (int i=0;i<10000; i++)
		{
			this.randomStarId = Random.Range(0, 10000);
			if (this.galaxyManager.galaxy.Stars.ContainsKey(this.randomStarId))
			{
				break;
			}
		}
		//this.randomStarId = 2015;
		//this.randomStarId = 2004;

		this.text = "Star " + this.randomStarId;
		this.originalText = this.text;
	}

	protected override void OnGUI() 
	{
		GUIStyle style = new GUIStyle(GUI.skin.button);
		style.fontStyle = FontStyle.Bold;
		style.richText = true;
		style.fontSize = Mathf.FloorToInt(VectorShape.ScaleSize(0.03f));
		style.wordWrap = true;
		//style.fontStyle
		float boarderSize = 2.0f;
		float sizeX =  (shape.points[0].x - shape.points[2].x - 2.0f*boarderSize);
		float sizeY =  (shape.points[0].y - shape.points[2].y - 2.0f*boarderSize);
		float x = shape.points[2].x + boarderSize;
		float y = ((Screen.height - shape.points[2].y)+boarderSize-sizeY- 2.0f*boarderSize);
		Rect buttonRect = new Rect(x, y, sizeX, sizeY);
		if (this.text == this.originalText)
		{
			if (GUI.Button(buttonRect, "<color=cyan>" + this.text + "</color>", style))
			{
				//GS.StarData star = GS.GameflowManager.Instance.galaxyManager.galaxy.Stars[2015];

				if (this.galaxyManager.galaxy.Stars.ContainsKey(this.randomStarId))
				{
					GS.StarData star = this.galaxyManager.galaxy.Stars[this.randomStarId];
					GS.Messenger.SendMessageFrom("ui", "starview_selected", star);
					this.text = "GALAXY VIEW";

					this.galaxyManager.GetStar(star.id, delegate(string error) {
						//Debug.Log("GetStar() error=" + error);
					});
					RootVectorItem root = this.parent as RootVectorItem;
					if (root != null)
					{
						root.Close();
					}
				}
			}
		}
		else
		{
			if (GUI.Button(buttonRect, "<color=cyan>" + this.text + "</color>", style))
			{
				GS.Messenger.SendMessageFrom("ui", "galaxyview_selected");
				NewRandomStar();
				RootVectorItem root = this.parent as RootVectorItem;
				if (root != null)
				{
					root.Close();
				}
			}
		}
	}
}

public class GalaxyViewVectorItem : VectorItem
{
	public GalaxyViewVectorItem(VectorItem _parent, Vector2 _position, float _size) 
	: base("Galaxy View", VectorItem.Type.Square, _parent, _position, _size)
	{
	}

	protected override void OnGUI() 
	{
		GUIStyle style = new GUIStyle(GUI.skin.button);
		style.fontStyle = FontStyle.Bold;
		style.richText = true;
		style.fontSize = Mathf.FloorToInt(VectorShape.ScaleSize(0.03f));
		style.wordWrap = true;
		//style.fontStyle
		float boarderSize = 2.0f;
		float sizeX =  (shape.points[0].x - shape.points[2].x - 2.0f*boarderSize);
		float sizeY =  (shape.points[0].y - shape.points[2].y - 2.0f*boarderSize);
		float x = shape.points[2].x + boarderSize;
		float y = ((Screen.height - shape.points[2].y)+boarderSize-sizeY- 2.0f*boarderSize);
		Rect buttonRect = new Rect(x, y, sizeX, sizeY);
		if (GUI.Button(buttonRect, "<color=cyan>" + this.text + "</color>", style))
		{
			GS.Messenger.SendMessageFrom("ui", "galaxyview_selected");
			RootVectorItem root = this.parent as RootVectorItem;
			if (root != null)
			{
				root.Close();
			}
		}
	}
}

public class RootVectorItem : VectorItem
{
	public bool IsOpen { get { return (this.children.Count > 0); } }

	public RootVectorItem(Vector2 _position, float _size) 
	: base(_position, _size)
	{
		this.maxChildren = 8;
	}

	public void Open()
	{
		Debug.Log("Open=" + this.IsOpen);
		if (!this.IsOpen)
		{
			float size = 0.18f;
			Vector2 childPosition = this.GetChildPosition(size, 0);
			VectorItem child = new RandomStarVectorItem(this, childPosition, size);
			this.AddChild(child);

			Vector2 childPosition2 = this.GetChildPosition(size, 1);
			VectorItem child2 = new GalaxyViewVectorItem(this, childPosition2, size);
			this.AddChild(child2);

			Debug.Log("this.position=" + this.position.x + "," + this.position.y);
			Debug.Log("childPosition=" + childPosition.x + "," + childPosition.y);
		}
	}

	public void Close()
	{
		if (this.IsOpen)
		{
			for(int i=0; i<this.children.Count; i++)
			{
				this.children[i].CloseAndDestroy();
			}
			this.children.Clear();
		}
	}
}

public class VectorMenu : GS.MessengerListener 
{
	private RootVectorItem rootMenu = null;
	private VectorItem starMenu = null;

	public GameObject homeButton;

	public void Awake()
	{
	}

	public void Start() 
	{
		InitMessenger("VectorMenu");
		if (this.homeButton != null)
		{
			float size = 0.25f;
			Vector3 screenPos = Camera.main.WorldToViewportPoint( homeButton.transform.position );
			Debug.Log("screenPos=" + screenPos.x + "," + screenPos.y + "," + screenPos.z);
			this.rootMenu = new RootVectorItem( new Vector2(screenPos.x, screenPos.y), size );
		}
	}

	public void Update() 
	{
		if (this.rootMenu != null)
		{
			this.rootMenu.Update();
		}
		if (this.starMenu != null)
		{
			starMenu.Update();
		}
	}

	public void OnGUI()
	{
		if (this.rootMenu != null)
		{
			this.rootMenu.OnGUIUpdate();
		}
		if (this.starMenu != null)
		{
			starMenu.OnGUIUpdate();
		}
	}

	public override bool OnMessage(string id, object obj1, object obj2)
	{

		switch(id)
		{
			case "galaxy_loaded":
			{
				Debug.Log("OnMessage galaxy_loaded");
				Vector2 screenPoint = new Vector2(0.061f, 0.88f);
				float size = 0.25f;
				//this.rootMenu = new RootVectorItem(screenPoint, size);
				break;
			}

			case "starview_reached":
			{
				//VectorLine.Destroy ( VectorLine.Destroy (
				GS.StarData data = obj1 as GS.StarData;
				Vector2 screenPoint = new Vector2(0.5f, 0.5f);
				float size = data.Radius * 0.08f;
				this.starMenu = new StarVectorItem(data.id, screenPoint, size);
				//MoveToTarget(data.Position, this.maxZoom);
				break;
			}

			case "galaxyview_selected":
			case "starview_selected":
			{
				if (this.starMenu != null)
				{
					this.starMenu.Destroy();
					this.starMenu = null;
				}
				break;
			}

			case "homebutton_clicked":
			{
				Debug.Log("homebutton_clicked open=" + this.rootMenu.IsOpen);
				if (this.rootMenu != null)
				{
					if (this.rootMenu.IsOpen)
					{
						this.rootMenu.Close();
					}
					else 
					{
						this.rootMenu.Open();
					}
				}
				break;
			}

			default:break;
		}

		return false;
	}

}

