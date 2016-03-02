#pragma strict

class TurnManager extends MonoBehaviour
{

private static var mInstance : TurnManager;
static function Get()
{
	return mInstance;
}
function Awake()
{
	mInstance = this;
}


} //TurnManager