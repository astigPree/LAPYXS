
import random
import string 
from datetime import datetime 
import re 
import math
from django.utils import timezone
 

_OFFSET = 1 # IMPORTANT! DO NOT CHANGE THIS VALUE BECAUSE IT AFFECTS THE ID GENERATION
def generate_obfuscated_id(obj_pk: int, length: int) -> str:
    """
    Generates an ID by adding an offset to the primary key and appending random characters.
    
    Args:
        obj_pk (int): The primary key of the object.
        length (int): Total desired length of the ID.
        offset (int): Number to add to the primary key for obfuscation.
    
    Returns:
        str: A unique ID string.
    """
    base_id = str(obj_pk + _OFFSET)
    if len(base_id) > length:
        # raise ValueError("Base ID exceeds desired length.")
        return base_id # Return the original base ID

    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length - len(base_id)))
    return f"{base_id}{random_part}"