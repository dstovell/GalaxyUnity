using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace GS
{

public enum GameflowStateType
{
	None = 0,
	Login,
	GalaxyView,
	StarView,
	SolarSystemView,
	SolarSystemOrbitCamView,
	AssetOrbitCamView
}

public class GameflowState 
{
	private bool isCurrentState = false;
	
	protected GameflowManager manager { get { return GameflowManager.Instance; } }

	public GameflowState()
	{
	}

	public virtual void OnBegin()
	{
		this.isCurrentState = true;
	}

	public virtual void OnEnd()
	{
		this.isCurrentState = false;
	}

	public virtual void OnUpdate() 
	{
	}

	public virtual void OnUpdateNotCurrent()
	{
	}

	public virtual bool OnMessage(string id, object obj1, object obj2)
	{
		return false;
	}
}

public class GameflowManager : MessengerListener 
{
	public static GameflowManager Instance = null;

	public LoginManager loginManager = null;
	public GalaxyManager galaxyManager = null;

	private Dictionary<GameflowStateType, GameflowState> states;
	public GameflowStateType currentState = GameflowStateType.None;

	public GameflowState CurrentState { get { return (this.currentState != GameflowStateType.None) ? this.states[this.currentState] : null; } }

	public void SetState(GameflowStateType stateId)
	{
		if (this.states.ContainsKey(stateId))
		{
			GameflowState newState = this.states[stateId];
			if (newState != this.CurrentState)
			{
				if (this.CurrentState != null)
				{
					this.CurrentState.OnEnd();
				}

				this.currentState = stateId;

				this.CurrentState.OnBegin();
			}
		}
	}

	void Awake()
	{
		if (Instance == null)
		{
			Instance = this;
		}
		this.states = new Dictionary<GameflowStateType, GameflowState>();
		this.loginManager = this.gameObject.AddComponent<LoginManager>();
		this.galaxyManager = this.gameObject.AddComponent<GalaxyManager>();

		this.states[GameflowStateType.Login] = new LoginGameflowState();
		this.states[GameflowStateType.GalaxyView] = new GalaxyViewGameflowState();
		this.states[GameflowStateType.StarView] = new StarViewGameflowState();
		this.states[GameflowStateType.SolarSystemView] = new SolarSystemViewGameflowState();
	}

	// Use this for initialization
	public void Start() 
	{
		this.SetState(GameflowStateType.Login);
	}
	
	// Update is called once per frame
	public void Update() 
	{
		foreach (KeyValuePair<GameflowStateType,GameflowState> entry in this.states)
		{
			if (entry.Key == this.currentState)
			{
				this.CurrentState.OnUpdate();
			}
			else
			{
				this.CurrentState.OnUpdateNotCurrent();
			}
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
				return false;
			}

			default:break;
		}

		return false;
	}
}

}
