from rest_framework import serializers
from .models import JournalEntry


#convert model -> JSON 
#Data is in format json when sending, it needs intepreter to change from json to instance 
#after that django sends model -> Serializer turns it into json
class JournalEntrySerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    class Meta: #the serializer behaves
        model = JournalEntry#Tells the serializer: “This serializer is for the JournalEntry model.”
        fields = '__all__' #take all fields from the model in the json
        read_only_fields = ['user'] #user doesnt need to send this field
        