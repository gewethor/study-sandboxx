from GrabzIt import GrabzItClient
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-u', '-url', type=str, help='url of target webpage', dest='url', required=False)
args = parser.parse_args()
print(format(args.url))

grabzIt = GrabzItClient.GrabzItClient("","") #Add Grabzit API Key and Secret
grabzIt.URLToImage(format(args.url))
filepath = "grabzit.png"
grabzIt.SaveTo(filepath)