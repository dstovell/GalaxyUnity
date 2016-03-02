#pragma strict

class StarBaseModuleComponent extends MonoBehaviour 
{
	private var type : String;
    private var mParentBase : StarBaseComponent;
    private var targetPosition : Vector3;
    private var previousPosition : Vector3;
    private var positionT : float = 1.0;
    
    private var combatant : CombatantComponent;

    function Awake()
    {
		combatant = gameObject.GetComponent(CombatantComponent);
    }
    
    function GetName() : String
    {
    	if (combatant && combatant.mCombatantConfig)
    		return combatant.mCombatantConfig["Name"].Value;
    		
    	return "";
    }
    
    function GetIcon() : Texture
    {
    	if (combatant && combatant.mCombatantIcon)
    		return combatant.mCombatantIcon;
    		
    	return null;
    }

    function Setup(parentBase : StarBaseComponent, starPos : Vector3, rotation : Quaternion)
    {
    	mParentBase = parentBase;
    	targetPosition = starPos;
    	previousPosition = starPos;
    	transform.position = starPos;
    	transform.rotation = rotation;
    	positionT = 1.0;
    }

    function MoveTo(newPos : Vector3)
    {
    	previousPosition = transform.localPosition;
    	targetPosition = newPos;
    	positionT = 0.0;
    }

    function IsMoving()
    {
    	return (positionT < 1.0);
    }

    function Update()
    {
    	if (IsMoving())
    	{
    		//1 second move time
    		positionT += Time.deltaTime * 3.0;

    		positionT = Mathf.Min(positionT, 1.0);
    		transform.localPosition = Vector3.Lerp(previousPosition, targetPosition, positionT);
    	}
    }

    function OnMouseDown() 
    {
        StarBaseGUI.Get().OnSelected(gameObject);
    }

    function OnSelected()
    {
        //Enable some selection highlighter
    }

    function OnUnSelected()
    {
        
    }
}