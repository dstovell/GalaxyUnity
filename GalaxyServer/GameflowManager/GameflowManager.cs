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
	//private bool isCurrentState = false;
	
	protected GameflowManager manager { get { return GameflowManager.Instance; } }

	public GameflowState()
	{
	}

	public virtual void OnBegin(GameflowStateType previousState, object obj1, object obj2)
	{
	}

	public virtual void OnEnd(GameflowStateType nextState, object obj1, object obj2)
	{
	}

	public virtual void OnUpdate() 
	{
	}

	public virtual void OnUpdateNotCurrent()
	{
	}

	public virtual void OnMessage(string id, object obj1, object obj2)
	{
	}
}

public class GameflowManager : MessengerListener 
{
	public static GameflowManager Instance = null;

	public LoginManager loginManager = null;
	public GalaxyManager galaxyManager = null;

	private Dictionary<GameflowStateType, GameflowState> states;
	public GameflowStateType currentState = GameflowStateType.None;
	private GameflowState CurrentState { get { return (this.currentState != GameflowStateType.None) ? this.states[this.currentState] : null; } }

	public bool IsState(GameflowStateType state) { return (this.currentState == state); }

	public void SetState(GameflowStateType stateId, object obj1 = null, object obj2 = null)
	{
		if (this.states.ContainsKey(stateId))
		{
			GameflowState newState = this.states[stateId];
			if (newState != this.CurrentState)
			{
				Debug.Log("******GameflowManager Change State " + this.currentState.ToString() + " -> " + stateId.ToString());
				if (this.CurrentState != null)
				{
					this.CurrentState.OnEnd(stateId, obj1, obj2);
				}
				
				GameflowStateType prevState = this.currentState;
				this.currentState = stateId;

				this.CurrentState.OnBegin(prevState, obj1, obj2);
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

		InitMessenger("GameflowManager");
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

	public override void OnMessage(string id, object obj1, object obj2)
	{
		if (this.CurrentState != null)
		{
			this.CurrentState.OnMessage(id, obj1, obj2);
		}
	}
}

}
